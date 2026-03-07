import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { TokenService } from './token.service';

@Controller()
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body('refresh_token') refreshToken: string) {
    return this.tokenService.refresh(refreshToken);
  }
}
