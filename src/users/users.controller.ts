import {
  Controller,
  Post,
  Delete,
  Get,
  Patch,
  Param,
  UseGuards,
  Req,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { StorageService } from 'src/storage/storage.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

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

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Patch('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateAvatar(
    @Req() req: Request & { user: { id: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarUrl = await this.storageService.uploadFile(file);
    return this.usersService.updateAvatar(req.user.id, avatarUrl);
  }
}
