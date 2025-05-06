import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUserFromPayload } from 'src/Decorators/user.decorator';

@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createReactionDto: CreateReactionDto,
    @GetUserFromPayload('sub') user_id: number,
  ) {
    return this.reactionsService.createOrUpdateOrDelete(
      createReactionDto,
      user_id,
    );
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.reactionsService.findAll();
  }
}
