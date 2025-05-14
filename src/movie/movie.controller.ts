import { Controller, Get, UseGuards } from '@nestjs/common';
import { MovieService } from './movie.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

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
