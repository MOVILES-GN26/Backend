import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { StorageService } from '../storage/storage.service';
import { TrendingService } from '../trending/trending.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
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
}
