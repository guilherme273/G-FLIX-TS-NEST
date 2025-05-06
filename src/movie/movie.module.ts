import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieEntity } from './entities/movie.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { ReactionsEntity } from 'src/reactions/entities/reaction.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovieEntity, CategoryEntity, ReactionsEntity]),
    AuthModule,
    HttpModule,
  ],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
