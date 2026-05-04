import { IsNotEmpty, IsString } from 'class-validator';

export class RecordViewedCategoryDto {
  @IsString()
  @IsNotEmpty()
  category: string;
}
