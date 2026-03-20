import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async addFavorite(userId: string, productId: string): Promise<void> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });
    if (!user) throw new NotFoundException('User not found');

    const alreadyFavorited = user.favorites.some(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (p: any) => p.id === productId,
    );
    if (!alreadyFavorited) {
      user.favorites.push({ id: productId } as any);
      await this.usersRepo.save(user);
    }
  }

  async removeFavorite(userId: string, productId: string): Promise<void> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });
    if (!user) throw new NotFoundException('User not found');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    user.favorites = user.favorites.filter((p: any) => p.id !== productId);
    await this.usersRepo.save(user);
  }

  async getFavorites(userId: string): Promise<any[]> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['favorites', 'favorites.seller'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user.favorites;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.first_name) user.first_name = dto.first_name;
    if (dto.last_name) user.last_name = dto.last_name;
    if (dto.major) user.major = dto.major;
    if (dto.password) user.password = await bcrypt.hash(dto.password, 10);

    return this.usersRepo.save(user);
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.avatar_url = avatarUrl;
    return this.usersRepo.save(user);
  }
}
