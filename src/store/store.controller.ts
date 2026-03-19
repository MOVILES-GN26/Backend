import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed.'), false);
        }
        cb(null, true);
      },
    }),
  )
  create(
    @Body() dto: CreateStoreDto,
    @UploadedFile() logo: Express.Multer.File,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.storeService.create(dto, req.user.id as string, logo);
  }

  @Get()
  findAll() {
    return this.storeService.findAll();
  }

  @Get('my-stores')
  @UseGuards(JwtAuthGuard)
  findMyStores(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.storeService.findByOwner(req.user.id as string);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed.'), false);
        }
        cb(null, true);
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
    @UploadedFile() logo: Express.Multer.File,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.storeService.update(id, dto, req.user.id as string, logo);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.storeService.remove(id, req.user.id as string);
  }
}
