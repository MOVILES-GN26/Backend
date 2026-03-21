import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { ALLOWED_MAJORS } from '../../common/constants/majors';

export class RegisterDto {
  @IsEmail()
  @MaxLength(100)
  @Matches(/@uniandes\.edu\.co$/, {
    message: 'Email must end with @uniandes.edu.co',
  })
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'first_name contains invalid characters',
  })
  first_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'last_name contains invalid characters',
  })
  last_name: string;

  @IsNotEmpty()
  @IsIn([...ALLOWED_MAJORS], { message: 'Invalid major' })
  major: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least 1 uppercase letter and 1 digit',
  })
  password: string;

  @IsString()
  @Matches(/^\d{7,20}$/, { message: 'phone_number must be numeric between 7 and 20 digits' })
  phone_number: string;

  @IsOptional()
  @Matches(/^\d+$/, { message: 'account_number must be numeric' })
  account_number?: string;
}
