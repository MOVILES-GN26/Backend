import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
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
}
