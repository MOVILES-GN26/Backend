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

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly postsRepo: Repository<Product>,
    private readonly storageService: StorageService,
    private readonly trendingService: TrendingService,
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
      .leftJoinAndSelect('post.seller', 'seller');

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
        created_at: post.created_at,
        seller: post.seller
          ? {
              id: post.seller.id,
              name: `${post.seller.first_name} ${post.seller.last_name}`,
              major: post.seller.major,
              avatar_url: post.seller.avatar_url,
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
        created_at: post.created_at,
        seller: post.seller
          ? {
              id: post.seller.id,
              name: `${post.seller.first_name} ${post.seller.last_name}`,
              major: post.seller.major,
              avatar_url: post.seller.avatar_url,
            }
          : null,
      })),
    };
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
