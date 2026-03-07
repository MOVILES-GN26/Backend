import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PostCondition } from '../../common/constants/conditions';

export class QueryProductsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(PostCondition)
  condition?: PostCondition;

  @IsOptional()
  @IsString()
  price_sort?: 'Lowest Price' | 'Highest Price';
}
