import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { NfcLoginDto } from './dto/nfc-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() _dto: ForgotPasswordDto) {
    // Placeholder — integrate email service later
    return { message: 'If that email exists, a reset link has been sent.' };
  }
  @Post('nfc-login')
  @HttpCode(200)
  nfcLogin(@Body() dto: NfcLoginDto) {
    return this.authService.nfcLogin(dto.userId);
  }
}
