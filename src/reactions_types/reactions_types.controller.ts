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
import { ReactionsTypesService } from './reactions_types.service';
import { CreateReactionsTypeDto } from './dto/create-reactions_type.dto';
import { UpdateReactionsTypeDto } from './dto/update-reactions_type.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('reactions-types')
export class ReactionsTypesController {
  constructor(private readonly reactionsTypesService: ReactionsTypesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createReactionsTypeDto: CreateReactionsTypeDto) {
    return this.reactionsTypesService.create(createReactionsTypeDto);
  }

  @Get()
  findAll() {
    return this.reactionsTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reactionsTypesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReactionsTypeDto: UpdateReactionsTypeDto,
  ) {
    return this.reactionsTypesService.update(+id, updateReactionsTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reactionsTypesService.remove(+id);
  }
}
