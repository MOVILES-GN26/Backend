import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { StorageService } from '../storage/storage.service';
import { TrendingService } from '../trending/trending.service';
import { InteractionsService } from '../interactions/interactions.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly postsRepo: Repository<Product>,
    private readonly storageService: StorageService,
    private readonly trendingService: TrendingService,
    private readonly interactionsService: InteractionsService,
  ) {}

  async create(
    dto: CreatePostDto,
    sellerId: string,
    files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required.');
    }

    const price = parseFloat(dto.price);
    if (isNaN(price) || price <= 0) {
      throw new BadRequestException('Price must be a positive number.');
    }

    const imageUrls = await Promise.all(
      files.map((file) => this.storageService.uploadFile(file)),
    );

    const post = this.postsRepo.create({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      building_location: dto.building_location,
      price,
      condition: dto.condition,
      image_urls: imageUrls,
      seller_id: sellerId,
      store_id: dto.store_id ?? null,
    });

    return this.postsRepo.save(post);
  }

  async findProducts(query: QueryProductsDto) {
    const qb = this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.seller', 'seller')
      .andWhere('post.is_sold = false');

    if (query.search) {
      qb.andWhere(
        '(LOWER(post.title) LIKE :search OR LOWER(post.description) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    if (query.category) {
      qb.andWhere('post.category = :category', { category: query.category });
      this.trendingService.recordSearch(query.category);
    }

    if (query.condition) {
      qb.andWhere('post.condition = :condition', {
        condition: query.condition,
      });
    }

    if (query.price_sort === 'Lowest Price') {
      qb.orderBy('post.price', 'ASC');
    } else if (query.price_sort === 'Highest Price') {
      qb.orderBy('post.price', 'DESC');
    } else {
      qb.orderBy('post.created_at', 'DESC');
    }

    const posts = await qb.getMany();

    return {
      items: posts.map((post) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        category: post.category,
        building_location: post.building_location,
        price: Number(post.price),
        condition: post.condition,
        image_urls: post.image_urls,
        is_sold: post.is_sold,
        created_at: post.created_at,
        seller: post.seller
          ? {
              id: post.seller.id,
              name: `${post.seller.first_name} ${post.seller.last_name}`,
              major: post.seller.major,
              avatar_url: post.seller.avatar_url,
              phone_number: post.seller.phone_number,
            }
          : null,
      })),
    };
  }

  async findProductsBySeller(sellerId: string) {
    const posts = await this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.seller', 'seller') // ← agrega esto
      .where('post.seller_id = :sellerId', { sellerId })
      .orderBy('post.created_at', 'DESC')
      .getMany();

    return {
      items: posts.map((post) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        category: post.category,
        building_location: post.building_location,
        price: Number(post.price),
        condition: post.condition,
        image_urls: post.image_urls,
        is_sold: post.is_sold,
        created_at: post.created_at,
        seller: post.seller
          ? {
              id: post.seller.id,
              name: `${post.seller.first_name} ${post.seller.last_name}`,
              major: post.seller.major,
              avatar_url: post.seller.avatar_url,
              phone_number: post.seller.phone_number,
            }
          : null,
      })),
    };
  }

  async findProductById(productId: string, viewerId: string | null) {
    const post = await this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.seller', 'seller')
      .where('post.id = :productId', { productId })
      .getOne();

    if (!post) return null;

    // record interaction (fire-and-forget)
    try {
      const sellerId = post.seller ? post.seller.id : null;
      this.interactionsService.recordView(viewerId, post.id, sellerId);
    } catch {
      // ignore
    }

    return {
      id: post.id,
      title: post.title,
      description: post.description,
      category: post.category,
      building_location: post.building_location,
      price: Number(post.price),
      condition: post.condition,
      image_urls: post.image_urls,
      is_sold: post.is_sold,
      created_at: post.created_at,
      seller: post.seller
        ? {
            id: post.seller.id,
            name: `${post.seller.first_name} ${post.seller.last_name}`,
            major: post.seller.major,
            avatar_url: post.seller.avatar_url,
            phone_number: post.seller.phone_number,
          }
        : null,
    };
  }

  async getProductStats(productId: string) {
    return this.interactionsService.getStats(productId);
  }

  async getRecommended(userId: string): Promise<{ items: any[] }> {
    // 1. Load the user's viewed_categories map
    const userRow = await this.postsRepo.manager
      .createQueryBuilder()
      .select('u.viewed_categories', 'viewed_categories')
      .from('users', 'u')
      .where('u.id = :userId', { userId })
      .getRawOne<{ viewed_categories: Record<string, number> | null }>();

    const map = userRow?.viewed_categories ?? {};
    const topCategories = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    if (topCategories.length === 0) {
      return { items: [] };
    }

    // 2. Fetch products in those categories, excluding own listings
    const posts = await this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.seller', 'seller')
      .where('post.is_sold = false')
      .andWhere('post.seller_id != :userId', { userId })
      .andWhere('post.category IN (:...categories)', { categories: topCategories })
      .getMany();

    // 3. Sort: by category rank first, then created_at DESC within group
    const categoryRank = new Map(topCategories.map((cat, i) => [cat, i]));
    posts.sort((a, b) => {
      const rankA = categoryRank.get(a.category) ?? 999;
      const rankB = categoryRank.get(b.category) ?? 999;
      if (rankA !== rankB) return rankA - rankB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const limited = posts.slice(0, 30);

    return {
      items: limited.map((post) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        category: post.category,
        building_location: post.building_location,
        price: Number(post.price),
        condition: post.condition,
        image_urls: post.image_urls,
        is_sold: post.is_sold,
        seller_id: post.seller_id,
        seller_name: post.seller ? `${post.seller.first_name} ${post.seller.last_name}` : null,
        seller_major: post.seller?.major ?? null,
        seller_avatar_url: post.seller?.avatar_url ?? null,
        seller_phone: post.seller?.phone_number ?? null,
        created_at: post.created_at,
      })),
    };
  }

  async getFavoritesCount(productId: string): Promise<{ count: number }> {
    const product = await this.postsRepo.findOne({
      where: { id: productId },
      relations: ['favoritedBy'],
    });
    if (!product)
      throw new NotFoundException(`Product #${productId} not found`);
    return { count: product.favoritedBy.length };
  }

  async deleteProduct(productId: string, requesterId: string): Promise<void> {
    const post = await this.postsRepo.findOne({ where: { id: productId } });

    if (!post) {
      throw new NotFoundException('Product not found');
    }

    if (post.seller_id !== requesterId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.postsRepo.remove(post);
  }
}
