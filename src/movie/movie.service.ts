import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieEntity } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { ReactionsEntity } from 'src/reactions/entities/reaction.entity';

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
  ) {}

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
}
