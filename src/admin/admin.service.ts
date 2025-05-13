/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ChangePermissionDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository, DataSource, Between } from 'typeorm';
import { MovieEntity } from 'src/movie/entities/movie.entity';
import { FavoritesEntity } from 'src/favorites/entities/favorite.entity';
import { ReactionsEntity } from 'src/reactions/entities/reaction.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { subMonths, startOfMonth, format } from 'date-fns';

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
      // 1. Pegando todos os usuários e a contagem total
      const [users, count] = await this.userRepository.findAndCount({
        select: ['id', 'name', 'email', 'type'],
      });
      const countAdmin = await this.userRepository.count({
        where: { type: 1 },
      });

      // 2. Pegando usuários criados nos últimos 12 meses
      const now = new Date();
      const twelveMonthsAgo = startOfMonth(subMonths(now, 11));

      const usersEvolution = await this.userRepository.find({
        where: {
          createdAt: Between(twelveMonthsAgo, now),
        },
      });

      // 3. Inicializando estrutura de crescimento para os últimos 12 meses
      const userGrowthData: { month: string; users: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(now, i);
        const month = format(date, 'MMM'); // Exemplo: "Jan", "Feb", etc.
        userGrowthData.push({ month, users: 0 });
      }

      // 4. Contando quantos usuários foram criados por mês
      usersEvolution.forEach((user) => {
        const month = format(user.createdAt, 'MMM');
        const entry = userGrowthData.find((item) => item.month === month);
        if (entry) {
          entry.users += 1;
        }
      });

      // 5. Retornando tudo
      return {
        users,
        count,
        userGrowthData,
        countAdmin,
      };
    } catch (e: unknown) {
      console.error(e);

      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Erro ao buscar dados, contate o suporte!',
        },
      });
    }
  }

  async deleteUser(id_user_del: number, id_user_current: number) {
    const emailMain = process.env.Email_Main;

    const user_del = await this.userRepository.findOne({
      where: { id: id_user_del },
    });

    if (user_del) {
      const isMainAdmin = await this.userRepository.findOne({
        where: { email: emailMain },
      });

      if (user_del?.id === isMainAdmin?.id) {
        throw new ConflictException({
          msg: {
            type: 'error',
            content: `Usuário ${isMainAdmin.email} não pode ser deletado!`,
          },
        });
      }

      const userCurrent = await this.userRepository.findOne({
        where: { id: id_user_current },
      });

      if (user_del?.id === userCurrent?.id) {
        throw new ConflictException({
          msg: {
            type: 'error',
            content: `A própria conta só pode ser deletada através do menu do usuário fora da área adminstrativa!`,
          },
        });
      }
      try {
        await this.userRepository.delete(user_del.id);
        return {
          msg: {
            type: 'success',
            content: 'Usuário Deletado com sucesso!',
          },
        };
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException({
          msg: {
            type: 'error',
            content: 'Erro ao deletar usuário, contate o suporte!',
          },
        });
      }
    } else {
      throw new NotFoundException({
        msg: {
          type: 'error',
          content: `Usuário não encontrado!`,
        },
      });
    }
  }

  async getMovies() {
    const movies = await this.movieRepository.find({
      relations: ['reactions', 'reactions.reactionType', 'favorites', 'views'],
      order: {
        title: 'ASC',
      },
    });

    return {
      movies,
    };
  }

  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  async changePermission(changePermission: ChangePermissionDto) {
    console.log(changePermission.id_user);
    const emailMain = process.env.Email_Main;
    const user = await this.userRepository.findOne({
      where: { id: changePermission.id_user },
    });

    if (!user) {
      throw new NotFoundException({
        msg: {
          type: 'error',
          content: `Usuário não encontrado!`,
        },
      });
    }

    if (user.email === emailMain) {
      throw new ConflictException({
        msg: {
          type: 'error',
          content: `Não é permitido alterar as permissões deste usuário!`,
        },
      });
    }

    try {
      await this.userRepository.save({
        ...user,
        type: Number(changePermission.type),
      });

      return {
        msg: {
          type: 'success',
          content: 'sucesso!',
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Erro ao trocar permissão do usuário, contate o suporte!',
        },
      });
    }
  }

  async deleteMovie(id: number) {
    const movieToDel = await this.movieRepository.findOne({ where: { id } });

    if (!movieToDel) {
      throw new NotFoundException({
        msg: {
          type: 'error',
          content: `Filme não encontrado!`,
        },
      });
    }

    try {
      await this.movieRepository.delete(id);
      return {
        msg: {
          type: 'success',
          content: `Filme ${movieToDel.title} deletado com sucesso!`,
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Erro ao deletar o filme, contate o suporte!',
        },
      });
    }
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
