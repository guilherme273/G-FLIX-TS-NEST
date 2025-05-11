import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import { MovieEntity } from 'src/movie/entities/movie.entity';
import { FavoritesEntity } from 'src/favorites/entities/favorite.entity';
import { ReactionsEntity } from 'src/reactions/entities/reaction.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(MovieEntity)
    private readonly movieRepository: Repository<MovieEntity>,
    @InjectRepository(FavoritesEntity)
    private readonly favoritesRepository: Repository<FavoritesEntity>,
    @InjectRepository(ReactionsEntity)
    private readonly reactionsRepository: Repository<ReactionsEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private dataSource: DataSource,
  ) {}

  async overview() {
    try {
      const userscount = await this.userRepository.count();
      const moviesCount = await this.movieRepository.count();
      const favoritesCount = await this.favoritesRepository.count();
      const reactionsCount = await this.reactionsRepository.count();

      const findmoviesForCategory = await this.categoryRepository.find({
        relations: ['movies', 'movies.views'],
        order: { name: 'ASC' },
      });

      const moviesPerCategory = findmoviesForCategory.map((category) => ({
        name: category.name,
        value: category.movies.length,
      }));
      const viewsPerCategory = findmoviesForCategory.map((category) => {
        const totalViews = category.movies.reduce((sum, movie) => {
          return sum + (movie.views?.length || 0);
        }, 0);

        return {
          name: category.name,
          value: totalViews,
        };
      });
      console.log(viewsPerCategory);
      return {
        userscount,
        moviesCount,
        favoritesCount,
        reactionsCount,
        moviesPerCategory,
        viewsPerCategory,
      };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Erro ao buscar dados, contate o suporte!',
        },
      });
    }
  }

  async getUsers() {
    try {
      const [users, count] = await this.userRepository.findAndCount();

      return {
        users,
        count,
      };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Erro ao buscar dados, contate o suporte!',
        },
      });
    }
  }

  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
