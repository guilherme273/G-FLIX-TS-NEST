import { Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieEntity } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { CategoryEntity } from 'src/category/entities/category.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(MovieEntity)
    private readonly movieRepository: Repository<MovieEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: { url: createMovieDto.url },
    });

    if (movie) {
      return {
        msg: {
          type: 'error',
          content: `Filme: ${movie.title} já cadastrado!`,
        },
      };
    }

    const category = await this.categoryRepository.findOne({
      where: { id: createMovieDto.category_id },
    });

    if (!category) {
      return {
        msg: {
          type: 'error',
          content: `Categoria não encontrada!`,
        },
      };
    }

    const movieCreated = await this.movieRepository.save({
      title: createMovieDto.title,
      url: createMovieDto.url,
      cover: createMovieDto.cover,
      category: category,
    });

    return {
      movieCreated,
      msg: {
        type: 'success',
        content: `Filme: ${movieCreated.title} cadastrado com sucesso!`,
      },
    };
  }

  async findAll() {
    const movies = await this.categoryRepository.find({
      relations: ['movies'],
      order: {
        name: 'ASC',
      },
    });

    return {
      movies,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} movie`;
  }

  update(id: number, updateMovieDto: UpdateMovieDto) {
    return `This action updates a #${id} movie`;
  }

  remove(id: number) {
    return `This action removes a #${id} movie`;
  }
}
