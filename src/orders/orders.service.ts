import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, DeliveryOption } from './orders.entity';
import { Product } from '../products/product.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    private readonly storage: StorageService,
  ) {}

  async create(buyerId: string, productId: string, quantity = 1, deliveryOption?: DeliveryOption) {
    const product = await this.productsRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const total = Number((Number(product.price) * quantity).toFixed(2));

    const order = this.ordersRepo.create({
      buyer_id: buyerId,
      seller_id: product.seller_id,
      product_id: product.id,
      quantity,
      total,
      delivery_option: (deliveryOption ?? null) as DeliveryOption | null,
    });

    return this.ordersRepo.save(order);
  }

  async findOne(id: string) {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async uploadPaymentProof(orderId: string, buyerId: string, file: Express.Multer.File) {
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyer_id !== buyerId) throw new ForbiddenException('Not order owner');

    const url = await this.storage.uploadFile(file);
    order.payment_proof_url = url;
    order.status = 'payment_uploaded';
    await this.ordersRepo.save(order);

    // Mark product as sold so it no longer appears in listings
    await this.productsRepo.update(order.product_id, { is_sold: true });

    return order;
  }

  async confirmPayment(orderId: string, sellerId: string) {
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.seller_id !== sellerId) throw new ForbiddenException('Not seller of this order');

    order.status = 'confirmed';
    return this.ordersRepo.save(order);
  }

  async findByProduct(productId: string, sellerId: string) {
    const product = await this.productsRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.seller_id !== sellerId) throw new ForbiddenException('Not seller of this product');

    return this.ordersRepo.find({ where: { product_id: productId } });
  }

  async setDeliveryDetails(orderId: string, userId: string, details: string) {
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyer_id !== userId && order.seller_id !== userId) throw new ForbiddenException();

    order.delivery_details = details;
    return this.ordersRepo.save(order);
  }
}
