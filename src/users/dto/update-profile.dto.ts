import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  last_name?: string;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @Matches(/^\d{7,20}$/, { message: 'phone_number must be numeric between 7 and 20 digits' })
  phone_number?: string;

  @IsOptional()
  @Matches(/^\d+$/, { message: 'account_number must be numeric' })
  account_number?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
