import { IsUUID, IsOptional, IsString, IsBoolean } from 'class-validator';

export class RecordInteractionDto {
  @IsUUID()
  product_id: string;

  @IsOptional()
  @IsString()
  seller_id?: string;

  @IsOptional()
  @IsBoolean()
  was_favorited?: boolean;
}