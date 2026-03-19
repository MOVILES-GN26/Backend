import { IsUUID, IsInt, Min, IsOptional, IsIn } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsIn(['pickup', 'shipping'])
  delivery_option?: 'pickup' | 'shipping';
}
