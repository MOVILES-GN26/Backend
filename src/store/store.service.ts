import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    private readonly storageService: StorageService,
  ) {}

  async create(
    dto: CreateStoreDto,
    ownerId: string,
    logo?: Express.Multer.File,
  ): Promise<Store> {
    const logo_url = logo ? await this.storageService.uploadFile(logo) : null;
    const store = this.storeRepo.create({
      ...dto,
      owner_id: ownerId,
      logo_url,
    });
    return await this.storeRepo.save(store);
  }

  async findAll(): Promise<Store[]> {
    return await this.storeRepo.find({ relations: ['owner'] });
  }

  async findOne(id: string): Promise<any> {
    const store = await this.storeRepo.findOne({
      where: { id },
      relations: ['owner', 'products', 'products.seller'], // ← agrega products.seller
    });
    if (!store) throw new NotFoundException(`Store #${id} not found`);

    return {
      ...store,
      products: store.products.map((product: any) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        id: product.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        title: product.title,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        description: product.description,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        category: product.category,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        building_location: product.building_location,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        price: Number(product.price),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        condition: product.condition,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        image_urls: product.image_urls,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        created_at: product.created_at,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        seller: product.seller
          ? {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              id: product.seller.id,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              name: `${product.seller.first_name} ${product.seller.last_name}`,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              major: product.seller.major,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              avatar_url: product.seller.avatar_url,
            }
          : null,
      })),
    };
  }

  async findByOwner(ownerId: string): Promise<Store[]> {
    return await this.storeRepo.find({
      where: { owner_id: ownerId },
      relations: ['products'],
    });
  }

  async update(
    id: string,
    dto: UpdateStoreDto,
    ownerId: string,
    logo?: Express.Multer.File,
  ): Promise<Store> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const store = await this.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (store.owner_id !== ownerId) throw new ForbiddenException();
    if (logo) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      store.logo_url = await this.storageService.uploadFile(logo);
    }
    Object.assign(store, dto);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.storeRepo.save(store);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const store = await this.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (store.owner_id !== ownerId) throw new ForbiddenException();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.storeRepo.remove(store);
  }
}
