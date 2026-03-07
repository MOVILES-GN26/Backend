import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

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
}
