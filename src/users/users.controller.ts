import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/favorites')
  @UseGuards(JwtAuthGuard)
  getFavorites(@Req() req: Request & { user: { id: string } }) {
    return this.usersService.getFavorites(req.user.id);
  }

  @Post('me/favorites/:productId')
  @UseGuards(JwtAuthGuard)
  addFavorite(
    @Param('productId') productId: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.usersService.addFavorite(req.user.id, productId);
  }

  @Delete('me/favorites/:productId')
  @UseGuards(JwtAuthGuard)
  removeFavorite(
    @Param('productId') productId: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.usersService.removeFavorite(req.user.id, productId);
  }
}
