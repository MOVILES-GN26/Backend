import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';
import { ProductsService } from './products.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Controller()
export class ProductsController {
  constructor(private readonly postsService: ProductsService) {}

  @Get('products')
  @SkipThrottle()
  @UseGuards(OptionalJwtGuard)
  getProducts(@Query() query: QueryProductsDto) {
    return this.postsService.findProducts(query);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image files are allowed.'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  createPost(
    @Body() dto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    const sellerId: string = req.user.id;
    return this.postsService.create(dto, sellerId, files);
  }
}
