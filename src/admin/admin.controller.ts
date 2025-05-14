import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Post,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ChangePermissionDto } from './dto/update-admin.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from './adminGuard';
import { GetUserFromPayload } from 'src/Decorators/user.decorator';
import { UpdateMovieDto } from 'src/movie/dto/update-movie.dto';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { GetMovieYoutubeDto } from 'src/movie/dto/create-movie.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  getProfile() {
    return true;
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('overview')
  getOverview() {
    return this.adminService.overview();
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('movies')
  getMovies() {
    return this.adminService.getMovies();
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('views')
  getViews() {
    return this.adminService.getViews();
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('categories')
  getCategories() {
    return this.adminService.getCategories();
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('category')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.adminService.createCategory(createCategoryDto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('movie')
  createMovie(@Body() movieYoutubeDto: GetMovieYoutubeDto) {
    return this.adminService.createMovie(movieYoutubeDto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete('user/:id')
  deleteUser(
    @Param('id') id: string,
    @GetUserFromPayload('sub') user_id: number,
  ) {
    return this.adminService.deleteUser(+id, user_id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete('movie/:id')
  deleteMovie(@Param('id') id: string) {
    return this.adminService.deleteMovie(+id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete('category/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(+id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch('movie')
  updateMovie(@Body() updateMovieDto: UpdateMovieDto) {
    return this.adminService.updateMovieDto(updateMovieDto);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch('change-permission')
  update(@Body() changePermissionDto: ChangePermissionDto) {
    return this.adminService.changePermission(changePermissionDto);
  }
}
