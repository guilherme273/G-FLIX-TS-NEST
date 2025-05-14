import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MovieEntity } from 'src/movie/entities/movie.entity';
import { FavoritesEntity } from 'src/favorites/entities/favorite.entity';
import { ReactionsEntity } from 'src/reactions/entities/reaction.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { HttpModule } from '@nestjs/axios';
import { ViewEntity } from 'src/view/entities/view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      MovieEntity,
      FavoritesEntity,
      ReactionsEntity,
      CategoryEntity,
      ViewEntity,
    ]),
    AuthModule,
    HttpModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
