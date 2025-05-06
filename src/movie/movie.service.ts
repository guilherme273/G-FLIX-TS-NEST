import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieDto, GetMovieYoutubeDto } from './dto/create-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieEntity } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { ReactionsEntity } from 'src/reactions/entities/reaction.entity';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YouTubeSnippet {
  title: string;
  thumbnails: {
    default: YouTubeThumbnail;
    medium: YouTubeThumbnail;
    high: YouTubeThumbnail;
  };
}

interface YouTubeVideoItem {
  snippet: YouTubeSnippet;
}

interface YouTubeApiResponse {
  items: YouTubeVideoItem[];
}

type ReactionCountRaw = {
  movieId: number;
  reactionTypeId: number;
  count: string;
};

type GroupedCounts = Record<number, Record<number, number>>;

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(MovieEntity)
    private readonly movieRepository: Repository<MovieEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ReactionsEntity)
    private readonly reactionsRepository: Repository<ReactionsEntity>,
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

  async create(movieYoutubeDto: GetMovieYoutubeDto) {
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

  async findAll() {
    try {
      const categories = await this.categoryRepository.find({
        relations: [
          'movies',
          'movies.reactions',
          'movies.reactions.reactionType',
          'movies.favorites',
          'movies.views',
        ],
        order: {
          name: 'ASC',
        },
      });

      const rawCounts: ReactionCountRaw[] = await this.reactionsRepository
        .createQueryBuilder('reaction')
        .select('reaction.id_movie', 'movieId')
        .addSelect('reaction.id_reactions_type', 'reactionTypeId')
        .addSelect('COUNT(*)', 'count')
        .groupBy('reaction.id_movie')
        .addGroupBy('reaction.id_reactions_type')
        .getRawMany();

      const groupedCounts: GroupedCounts = rawCounts.reduce((acc, curr) => {
        const movieId = Number(curr.movieId);
        const reactionTypeId = Number(curr.reactionTypeId);
        const count = parseInt(curr.count, 10);

        if (!acc[movieId]) acc[movieId] = {};
        acc[movieId][reactionTypeId] = count;

        return acc;
      }, {} as GroupedCounts);

      for (const category of categories) {
        for (const movie of category.movies) {
          movie.reactionCounts = groupedCounts[movie.id] ?? {};
        }
      }

      return {
        movies: categories,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Erro ao buscar os filmes, contate o suporte!',
        },
      });
    }
  }

  extractYouTubeID = (url: string) => {
    const regex =
      /(?:\?v=|&v=|youtu\.be\/|embed\/|\/v\/|\/e\/|watch\?v=|watch\?.+&v=)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
}
