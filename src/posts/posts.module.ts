import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { StorageModule } from '../storage/storage.module';
import { TrendingModule } from '../trending/trending.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), StorageModule, TrendingModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
