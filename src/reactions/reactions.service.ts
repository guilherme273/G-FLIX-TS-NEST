import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReactionsEntity } from './entities/reaction.entity';
import { Repository } from 'typeorm';
import { ReactionTypeEntity } from 'src/reactions_types/entities/reactions_type.entity';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(ReactionsEntity)
    private readonly reactionsRepository: Repository<ReactionsEntity>,
  ) {}

  async createOrUpdateOrDelete(
    createReactionDto: CreateReactionDto,
    user_id: number,
  ) {
    try {
      const existSomeReactionForThisMovie =
        await this.reactionsRepository.findOne({
          where: {
            id_user: user_id,
            id_movie: createReactionDto.id_movie,
          },
        });

      if (existSomeReactionForThisMovie) {
        if (
          existSomeReactionForThisMovie.id_reactions_type ===
          createReactionDto.id_reactions_type
        ) {
          await this.reactionsRepository.delete(existSomeReactionForThisMovie);
          return {
            msg: {
              type: 'success',
              content: 'Reação Deletada!',
            },
          };
        }

        existSomeReactionForThisMovie.reactionType = {
          id: createReactionDto.id_reactions_type,
        } as ReactionTypeEntity;

        const updatedReaction = await this.reactionsRepository.save(
          existSomeReactionForThisMovie,
        );
        return {
          updatedReaction,
          msg: {
            type: 'success',
            content: 'Reação Atualizada!',
          },
        };
      }

      const newReactionForThisMovie = await this.reactionsRepository.save({
        ...createReactionDto,
        id_user: user_id,
      });

      return {
        newReactionForThisMovie,
        msg: {
          type: 'success',
          content: 'Reação Criada!',
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Error ao manipular reações, contate o suporte!',
        },
      });
    }
  }

  async findAll() {
    try {
      const reactions = await this.reactionsRepository.find();
      return {
        reactions,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
