import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { ChangePermissionDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository, DataSource, Between } from 'typeorm';
import { MovieEntity } from 'src/movie/entities/movie.entity';
import { FavoritesEntity } from 'src/favorites/entities/favorite.entity';
import { ReactionsEntity } from 'src/reactions/entities/reaction.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { subMonths, startOfMonth, format } from 'date-fns';
import { UpdateMovieDto } from 'src/movie/dto/update-movie.dto';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

import {
  CreateMovieDto,
  GetMovieYoutubeDto,
  YouTubeApiResponse,
} from 'src/movie/dto/create-movie.dto';
import { ViewEntity } from 'src/view/entities/view.entity';

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

    @InjectRepository(ViewEntity)
    private readonly viewsRepository: Repository<ViewEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,

    private dataSource: DataSource,
    private readonly httpService: HttpService,
  ) {}

  private async fetchYouTubeData(
    movieYoutubeDto: GetMovieYoutubeDto,
  ): Promise<CreateMovieDto> {
    const urlMovie = movieYoutubeDto.url;
    const shortenedUrl = urlMovie.slice(0, 43);
    const youtubeId = this.extractYouTubeID(shortenedUrl);
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!youtubeId) {
      throw new BadRequestException({
        msg: { type: 'error', content: 'URL inválida!' },
      });
    }

    const url = `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&part=snippet,contentDetails,statistics&key=${apiKey}`;

    try {
      const response$ = this.httpService.get<YouTubeApiResponse>(url);
      const response = await lastValueFrom(response$);
      const result = response.data;

      const imageUrl = result.items[0]?.snippet?.thumbnails?.medium?.url;
      const title = result.items[0]?.snippet?.title;

      const createMovieDto: CreateMovieDto = {
        title: title,
        url: urlMovie,
        cover: imageUrl,
        category_id: Number(movieYoutubeDto.category_id),
        youtube_id: youtubeId,
      };
      return createMovieDto;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Erro ao buscar dados do YouTube!',
        },
      });
    }
  }

  async createMovie(movieYoutubeDto: GetMovieYoutubeDto) {
    const createMovieDto = await this.fetchYouTubeData(movieYoutubeDto);
    const movie = await this.movieRepository.findOne({
      where: { url: createMovieDto.url },
    });

    if (movie) {
      throw new ConflictException({
        msg: {
          type: 'error',
          content: `Filme: ${movie.title} já cadastrado!`,
        },
      });
    }

    const category = await this.categoryRepository.findOne({
      where: { id: createMovieDto.category_id },
    });

    if (!category) {
      throw new NotFoundException({
        msg: {
          type: 'error',
          content: `Categoria não encontrada!`,
        },
      });
    }

    try {
      const movieCreated = await this.movieRepository.save({
        title: createMovieDto.title,
        url: createMovieDto.url,
        cover: createMovieDto.cover,
        category: category,
        youtube_id: createMovieDto.youtube_id,
      });

      return {
        movieCreated,
        msg: {
          type: 'success',
          content: `Filme: ${movieCreated.title} cadastrado com sucesso!`,
        },
      };
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Erro ao salvar o filme, contate o suporte!',
        },
      });
    }
  }

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
      const userGrowthData: { name: string; value: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(now, i);
        const name = format(date, 'MMM'); // Exemplo: "Jan", "Feb", etc.
        userGrowthData.push({ name, value: 0 });
      }

      // 4. Contando quantos usuários foram criados por mês
      usersEvolution.forEach((user) => {
        const name = format(user.createdAt, 'MMM');
        const entry = userGrowthData.find((item) => item.name === name);
        if (entry) {
          entry.value += 1;
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

  async deleteCategory(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException({
        msg: { type: 'success', content: 'Categoria não encontrada' },
      });
    }

    const hasRelation = await this.movieRepository.findOne({
      where: { category: category },
    });
    if (hasRelation) {
      throw new ConflictException({
        msg: {
          type: 'error',
          content: `Antes de excluir esta categoria, atribua uma nova categoria aos filmes que estão relacionados a ela!`,
        },
      });
    }

    try {
      await this.categoryRepository.delete(category.id);
      return {
        msg: {
          type: 'success',
          content: `Categoria ${category.name} excluída com sucesso!`,
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Erro ao deletar categoria, contate o suporte!',
        },
      });
    }
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (category) {
      throw new ConflictException({
        msg: {
          type: 'error',
          content: `Categoria: ${category.name} já cadastrada!`,
        },
      });
    }

    try {
      const categoryCreated =
        await this.categoryRepository.save(createCategoryDto);

      return {
        categoryCreated,
        msg: {
          type: 'success',
          content: `Categoria: ${categoryCreated.name} cadastrada com sucesso!`,
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'erro no servidor ao salvar categoria, contate o suporte!',
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
      relations: [
        'reactions',
        'reactions.reactionType',
        'favorites',
        'views',
        'category',
      ],
      order: {
        title: 'ASC',
      },
    });

    const top10MostViewed = movies
      .map((movie) => {
        const viewsCount = movie.views?.length || 0;
        return {
          ...movie,
          viewsCount,
        };
      })
      .sort((a, b) => b.viewsCount - a.viewsCount)
      .slice(0, 10);

    const findmoviesForCategory = await this.categoryRepository.find({
      relations: ['movies', 'movies.views'],
      order: { name: 'ASC' },
    });

    const moviesPerCategory = findmoviesForCategory.map((category) => ({
      name: category.name,
      value: category.movies.length,
    }));

    return {
      movies,
      moviesPerCategory,
      top10MostViewed,
    };
  }

  async updateMovieDto(updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: { id: updateMovieDto.id_movie },
    });

    if (!movie) {
      throw new NotFoundException({
        msg: {
          type: 'error',
          content: `Filme não encontrado!`,
        },
      });
    }

    const category = await this.categoryRepository.findOne({
      where: { id: +updateMovieDto.category_id },
    });
    if (!category) {
      throw new NotFoundException({
        msg: {
          type: 'error',
          content: `Categoria desconhecida!`,
        },
      });
    }

    try {
      movie.title = updateMovieDto.title;
      movie.category = category;

      // Salva as alterações
      const movieUpdated = await this.movieRepository.save(movie);

      return {
        msg: {
          type: 'success',
          content: 'Filme atualizado com sucesso!',
        },
        data: movieUpdated,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Erro ao atualizar filme, contate o suporte!',
        },
      });
    }
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

  async getCategories() {
    try {
      const categories = await this.categoryRepository.find({
        relations: ['movies', 'movies.views'],
        order: {
          name: 'ASC',
        },
      });
      return {
        categories,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getViews() {
    const findmoviesForCategory = await this.categoryRepository.find({
      relations: ['movies', 'movies.views'],
      order: { name: 'ASC' },
    });

    const viewsPerCategory = findmoviesForCategory.map((category) => {
      const totalViews = category.movies.reduce((sum, movie) => {
        return sum + (movie.views?.length || 0);
      }, 0);

      return {
        name: category.name,
        value: totalViews,
      };
    });

    const secondsWatchedPerCategory = findmoviesForCategory.map((category) => {
      const totalSeconds = category.movies.reduce((movieSum, movie) => {
        const movieSeconds =
          movie.views?.reduce((viewSum, view) => {
            return viewSum + (view.seconds_watched || 0);
          }, 0) || 0;

        return movieSum + movieSeconds;
      }, 0);

      return {
        name: category.name,
        value: totalSeconds,
      };
    });

    // Exemplo de código para montar o array com base nos últimos 30 dias
    const views = await this.viewsRepository.find({
      order: {
        createdAt: 'ASC',
      },
    });

    // Obter a data atual
    const today = new Date();

    // Definir a data de 30 dias atrás
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 10);

    // Filtrar os registros que estão dentro dos últimos 30 dias
    const filteredViews = views.filter((view) => {
      const viewDate = new Date(view.createdAt); // Supondo que cada 'view' tenha uma data
      return viewDate >= thirtyDaysAgo && viewDate <= today;
    });

    // Criar um mapa para armazenar os minutos assistidos por dia
    const dailyMinutes = filteredViews.reduce((acc, view) => {
      const viewDate = new Date(view.createdAt);
      const day = viewDate.toLocaleDateString('pt-BR'); // Formatar a data como 'dd/mm'
      const minutes = view.seconds_watched / 60; // Converter segundos para minutos
      if (!acc[day]) {
        acc[day] = 0; // Iniciar a contagem de minutos para esse dia
      }
      acc[day] += minutes; // Somar os minutos assistidos no dia
      return acc;
    }, {});
    // Transformar o objeto em um array de objetos no formato desejado
    const resultsArray = Object.entries(dailyMinutes).map(
      ([day, minutesWatched]) => ({
        name: day,
        value: minutesWatched,
      }),
    );

    return {
      viewsPerCategory,
      secondsWatchedPerCategory,
      minutesForDay: resultsArray,
    };
  }

  extractYouTubeID = (url: string) => {
    const regex =
      /(?:\?v=|&v=|youtu\.be\/|embed\/|\/v\/|\/e\/|watch\?v=|watch\?.+&v=)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
}
