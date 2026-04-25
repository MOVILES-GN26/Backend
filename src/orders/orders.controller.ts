import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Get,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() dto: CreateOrderDto) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Missing user');
    return this.ordersService.create(userId, dto.product_id, dto.quantity, dto.delivery_option);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getByProduct(@Request() req: any, @Query('product_id') productId: string) {
    const sellerId = req.user?.id;
    if (!productId) throw new BadRequestException('product_id query param is required');
    return this.ordersService.findByProduct(productId, sellerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Request() req: any, @Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    const userId = req.user?.id;
    // allow buyer or seller to view
    if (order.buyer_id !== userId && order.seller_id !== userId) throw new BadRequestException('Not authorized');
    return order;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/upload-proof')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadProof(@Request() req: any, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user?.id;
    if (!file) throw new BadRequestException('No file uploaded');
    return this.ordersService.uploadPaymentProof(id, userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/confirm')
  async confirm(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.ordersService.confirmPayment(id, userId);
  }
}
