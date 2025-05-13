import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';

import { ChangePermissionDto } from './dto/update-admin.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from './adminGuard';
import { GetUserFromPayload } from 'src/Decorators/user.decorator';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch('change-permission')
  update(@Body() changePermissionDto: ChangePermissionDto) {
    return this.adminService.changePermission(changePermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
