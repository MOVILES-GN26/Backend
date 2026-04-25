import { IsUUID, IsOptional, IsString } from 'class-validator';

export class RecordInteractionDto {
  @IsUUID()
  product_id: string;

  @IsOptional()
  @IsString()
  seller_id?: string;
  was_favorited?: boolean;
}
