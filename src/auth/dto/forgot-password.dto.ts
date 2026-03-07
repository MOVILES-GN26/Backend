import { IsEmail, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/@uniandes\.edu\.co$/, {
    message: 'Email must end with @uniandes.edu.co',
  })
  email: string;
}
