import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PostCondition } from '../../common/constants/conditions';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  category: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  building_location: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'price must be a valid positive number (e.g. 45000 or 45000.50)',
  })
  price: string;

  @IsEnum(PostCondition, {
    message: 'condition must be one of: New, Like New, Good, Fair',
  })
  condition: PostCondition;

  // 👇 esto es lo nuevo
  @IsUUID()
  @IsOptional()
  store_id?: string;
}
