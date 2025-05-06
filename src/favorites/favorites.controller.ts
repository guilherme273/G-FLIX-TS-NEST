import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUserFromPayload } from 'src/Decorators/user.decorator';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createFavoriteDto: CreateFavoriteDto,
    @GetUserFromPayload('sub') user_id: number,
  ) {
    return this.favoritesService.createOrDelete(createFavoriteDto, user_id);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.favoritesService.findAll();
  }
}
