import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
export class HomeController {
  @Get('home')
  @UseGuards(JwtAuthGuard)
  home() {
    return { status: 'ok' };
  }
}
