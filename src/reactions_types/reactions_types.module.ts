import { Module } from '@nestjs/common';
import { ReactionsTypesService } from './reactions_types.service';
import { ReactionsTypesController } from './reactions_types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionTypeEntity } from './entities/reactions_type.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ReactionTypeEntity]), AuthModule],
  controllers: [ReactionsTypesController],
  providers: [ReactionsTypesService],
})
export class ReactionsTypesModule {}
