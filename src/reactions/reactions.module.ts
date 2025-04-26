import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionsEntity } from './entities/reaction.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReactionsEntity]), AuthModule],
  controllers: [ReactionsController],
  providers: [ReactionsService],
})
export class ReactionsModule {}
