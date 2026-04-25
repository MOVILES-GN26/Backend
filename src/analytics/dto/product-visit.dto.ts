import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductVisitSource } from '../entities/product-visit.entity';

export class ProductVisitDto {
  @Transform(({ obj }) => obj.product_id ?? obj.productId)
  @IsUUID()
  product_id: string;

  @IsIn([ProductVisitSource.HOME, ProductVisitSource.CATALOG, ProductVisitSource.FAVORITES])
  source: ProductVisitSource;

  // allow either product_id or productId in the payload
  @IsOptional()
  productId?: string;
}
