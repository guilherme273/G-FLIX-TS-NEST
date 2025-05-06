import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoritesEntity } from './entities/favorite.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoritesEntity)
    private readonly favoritesRepository: Repository<FavoritesEntity>,
  ) {}

  async createOrDelete(createFavoriteDto: CreateFavoriteDto, user_id: number) {
    try {
      const isForDelete = await this.favoritesRepository.findOne({
        where: {
          id_movie: createFavoriteDto.id_movie,
          id_user: user_id,
        },
      });

      if (isForDelete) {
        await this.favoritesRepository.delete(isForDelete);
        return {
          msg: {
            type: 'success',
            content: 'Filme removido dos favoritos!',
          },
        };
      }

      await this.favoritesRepository.save({
        ...createFavoriteDto,
        id_user: user_id,
      });
      return {
        msg: {
          type: 'success',
          content: 'Filme adicionado aos favoritos!',
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Erro na requisição, contate o suporte!',
        },
      });
    }
  }

  async findAll() {
    try {
      const favorites = await this.favoritesRepository.find();
      return {
        favorites,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
