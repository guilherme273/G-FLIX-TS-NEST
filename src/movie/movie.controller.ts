import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MovieService } from './movie.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetMovieYoutubeDto } from './dto/create-movie.dto';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() movieYoutubeDto: GetMovieYoutubeDto) {
    return this.movieService.create(movieYoutubeDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.movieService.findAll();
  }

  @Get('teste')
  teste() {
    console.log('chegou no back!');
  }
}
