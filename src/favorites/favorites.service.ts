import { Injectable } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoritesEntity } from './entities/favorite.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoritesEntity)
    private readonly favoritesRepository: Repository<FavoritesEntity>,
  ) {}

  async createOrDelete(createFavoriteDto: CreateFavoriteDto) {
    const isForDelete = await this.favoritesRepository.findOne({
      where: {
        id_movie: createFavoriteDto.id_movie,
        id_user: createFavoriteDto.id_user,
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

    await this.favoritesRepository.save(createFavoriteDto);
    return {
      msg: {
        type: 'success',
        content: 'Filme adicionado aos favoritos!',
      },
    };
  }

  findAll() {
    return `This action returns all favorites`;
  }

  findOne(id: number) {
    return `This action returns a #${id} favorite`;
  }

  update(id: number, updateFavoriteDto: UpdateFavoriteDto) {
    return `This action updates a #${id} favorite`;
  }

  remove(id: number) {
    return `This action removes a #${id} favorite`;
  }
}
