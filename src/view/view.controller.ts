import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ViewService } from './view.service';
import { CreateViewDto } from './dto/create-view.dto';
import { UpdateViewDto } from './dto/update-view.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUserFromPayload } from 'src/Decorators/user.decorator';

@Controller('view')
export class ViewController {
  constructor(private readonly viewService: ViewService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createViewDto: CreateViewDto,
    @GetUserFromPayload('sub') user_id: number,
  ) {
    return this.viewService.create(createViewDto, user_id);
  }

  @Get()
  findAll() {
    return this.viewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.viewService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateViewDto: UpdateViewDto) {
    return this.viewService.update(+id, updateViewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.viewService.remove(+id);
  }
}
