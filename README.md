# AndesHub — Backend API

Campus marketplace for **Universidad de los Andes** students.  
NestJS + TypeScript · PostgreSQL · JWT auth · MinIO (S3) · Docker

---

## Quick Start

```bash
cp .env.example .env          # then set JWT_SECRET (≥ 32 random chars)
docker compose up --build      # starts api + postgres + minio
curl http://localhost:3000/health   # → {"status":"ok"}
```

| Service      | Port(s)         | Description                  |
| ------------ | --------------- | ---------------------------- |
| **api**      | `3000`          | NestJS backend               |
| **postgres** | `5432`          | PostgreSQL 16                |
| **minio**    | `9000` / `9001` | S3-compatible object storage |

### Without Docker

```bash
npm install
# Set DB_HOST=localhost and MINIO_ENDPOINT=http://localhost:9000 in .env
npm run start:dev
```

---

## Environment Variables

See [.env.example](.env.example) for all variables. Key ones:

| Variable       | Required | Notes                                             |
| -------------- | -------- | ------------------------------------------------- |
| `JWT_SECRET`   | **Yes**  | ≥ 32 random chars. App **refuses to start** without it |
| `DB_HOST`      | Yes      | `postgres` (Docker) or `localhost` (local dev)    |
| `DB_PASSWORD`  | Yes      | Postgres password                                 |
| `MINIO_ENDPOINT` | Yes   | `http://minio:9000` (Docker) or `http://localhost:9000` |
| `CORS_ORIGIN`  | No       | Defaults to `*` — set a specific origin in production  |

---

## API Endpoints

All responses use **snake_case** keys.

### Auth

| Method | Path                     | Auth | Description          |
| ------ | ------------------------ | ---- | -------------------- |
| POST   | `/auth/register`         | No   | Create account       |
| POST   | `/auth/login`            | No   | Log in               |
| POST   | `/auth/forgot-password`  | No   | Request password reset (stub) |

### Root-level

| Method | Path       | Auth     | Description                |
| ------ | ---------- | -------- | -------------------------- |
| POST   | `/refresh` | No (body)| Rotate tokens via `refresh_token` in body |
| GET    | `/home`    | Bearer   | Token liveness check       |
| GET    | `/health`  | No       | ALB/ECS health probe       |

### Products

| Method | Path        | Auth     | Description             |
| ------ | ----------- | -------- | ----------------------- |
| GET    | `/products` | Optional | Browse/search products  |
| POST   | `/posts`    | Bearer   | Create post (multipart) |

---

### `POST /auth/register`

```json
{
  "first_name": "Sofia",
  "last_name": "Rodriguez",
  "email": "s.rodriguez@uniandes.edu.co",
  "major": "Ingeniería de Sistemas y Computación",
  "password": "MyPass123"
}
```

- Email must end with `@uniandes.edu.co`
- Password: 8–100 chars, ≥ 1 uppercase, ≥ 1 digit

**201** → `{ access_token, refresh_token, user: { id, email, first_name, last_name, major } }`  
**409** → `{ message: "A user with this email already exists." }`

### `POST /auth/login`

```json
{ "email": "s.rodriguez@uniandes.edu.co", "password": "MyPass123" }
```

**200** → same shape as register  
**401** → `{ message: "Incorrect email or password." }`

### `POST /auth/forgot-password`

Body: `{ "email": "..." }` — returns **200** (stub; email service not yet integrated).

### `POST /refresh`

Body: `{ "refresh_token": "<token>" }`  
**200** → `{ access_token, refresh_token }`

### `GET /products`

Query params (all optional): `?search=laptop&category=Electronics&condition=New&price_sort=Lowest Price`

```json
{
  "items": [{
    "id": "uuid", "title": "Calculus Textbook", "description": "...",
    "category": "Books & Supplies", "building_location": "Biblioteca General",
    "price": 45000, "condition": "Like New",
    "image_urls": ["https://..."],
    "created_at": "2025-01-15T10:30:00.000Z",
    "seller": { "id": "uuid", "name": "Sofia Rodriguez", "major": "...", "avatar_url": "..." }
  }]
}
```

### `POST /posts` (multipart/form-data)

Fields: `title`, `description`, `category`, `building_location`, `price` (string), `condition`  
File field: **`images`** (max 5 MB each, `image/*` only)  
`seller_id` is taken from the JWT — never from the client.

---

## Data Models

### User

| Column       | Type         | Notes                                    |
| ------------ | ------------ | ---------------------------------------- |
| `id`         | UUID         | PK                                       |
| `email`      | VARCHAR(100) | Unique, must end `@uniandes.edu.co`      |
| `password`   | VARCHAR      | bcrypt-hashed, **never returned**        |
| `first_name` | VARCHAR(50)  | 2–50 chars                               |
| `last_name`  | VARCHAR(50)  | 2–50 chars                               |
| `major`      | VARCHAR(50)  | One of 29 allowed values (see `common/constants/majors.ts`) |
| `avatar_url` | VARCHAR      | Nullable                                 |

### Post

| Column             | Type          | Notes                                |
| ------------------ | ------------- | ------------------------------------ |
| `id`               | UUID          | PK                                   |
| `title`            | VARCHAR(50)   |                                      |
| `description`      | VARCHAR(200)  |                                      |
| `category`         | VARCHAR(50)   | Free text                            |
| `building_location`| VARCHAR(200)  |                                      |
| `price`            | DECIMAL(10,2) | > 0                                  |
| `condition`        | ENUM          | `New` · `Like New` · `Good` · `Fair` |
| `image_urls`       | TEXT[]         | Min 1                                |
| `seller_id`        | UUID          | FK → User, from JWT                  |

---

## Project Structure

```
src/
├── main.ts                    # Bootstrap, CORS, validation pipes
├── app.module.ts              # Root module
├── auth/                      # /auth/register, /auth/login, /auth/forgot-password
├── users/                     # User entity & service
├── posts/                     # POST /posts, GET /products
├── token/                     # POST /refresh
├── home/                      # GET /home (JWT liveness check)
├── health/                    # GET /health (ALB probe)
├── storage/                   # MinIO upload service
└── common/
    ├── constants/             # majors.ts, conditions.ts
    └── guards/                # optional-jwt.guard.ts
```

---

## Adding a New Entity

1. Create `src/<feature>/<feature>.entity.ts` with TypeORM decorators
2. Create `src/<feature>/dto/` with class-validator DTOs
3. Create `src/<feature>/<feature>.service.ts` with `@InjectRepository()`
4. Create `src/<feature>/<feature>.controller.ts` with routes + guards
5. Create `src/<feature>/<feature>.module.ts` importing `TypeOrmModule.forFeature([Entity])`
6. Register the entity in `app.module.ts` → `entities: [User, Post, YourEntity]`
7. Import the module in `app.module.ts` → `imports: [..., YourModule]`

---

## Security

- JWT secret validated at startup — app **crashes** if `JWT_SECRET` is missing
- Access and refresh tokens have distinct `type` claims (cannot be swapped)
- `ThrottlerGuard` applied globally (10 req/min)
- Passwords bcrypt-hashed (10 rounds), never returned in responses
- `@uniandes.edu.co` enforced on both login and register
- `seller_id` always from JWT, never from request body
- File uploads: 5 MB limit, `image/*` MIME check
- All queries parameterized via TypeORM (no raw SQL)

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
