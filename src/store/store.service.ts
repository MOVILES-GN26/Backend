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

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  async create(dto: CreateStoreDto, ownerId: string): Promise<Store> {
    const store = this.storeRepo.create({
      ...dto,
      owner_id: ownerId,
    });
    return await this.storeRepo.save(store);
  }

  async findAll(): Promise<Store[]> {
    return await this.storeRepo.find({
      relations: ['owner'],
    });
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepo.findOne({
      where: { id },
      relations: ['owner', 'products'],
    });
    if (!store) throw new NotFoundException(`Store #${id} not found`);
    return store;
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
  ): Promise<Store> {
    const store = await this.findOne(id);
    if (store.owner_id !== ownerId) throw new ForbiddenException();
    Object.assign(store, dto);
    return await this.storeRepo.save(store);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const store = await this.findOne(id);
    if (store.owner_id !== ownerId) throw new ForbiddenException();
    await this.storeRepo.remove(store);
  }
}
