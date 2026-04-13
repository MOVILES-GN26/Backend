import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(100)
  @Matches(/@uniandes\.edu\.co$/, {
    message: 'Email must end with @uniandes.edu.co',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsIn(['NFC', 'email-password'])
  login_type?: 'NFC' | 'email-password';
}
