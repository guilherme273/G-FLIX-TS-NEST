import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateReactionsTypeDto } from './dto/create-reactions_type.dto';
import { UpdateReactionsTypeDto } from './dto/update-reactions_type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReactionTypeEntity } from './entities/reactions_type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReactionsTypesService {
  constructor(
    @InjectRepository(ReactionTypeEntity)
    private readonly reactionTypeRepository: Repository<ReactionTypeEntity>,
  ) {}

  async create(createReactionsTypeDto: CreateReactionsTypeDto) {
    const existThisReactionType = await this.reactionTypeRepository.findOne({
      where: { name: createReactionsTypeDto.name },
    });

    if (existThisReactionType) {
      throw new ConflictException({
        msg: {
          type: 'error',
          content: 'Tipo de reação já existente!',
        },
      });
    }

    try {
      const reactionType = await this.reactionTypeRepository.save(
        createReactionsTypeDto,
      );

      return {
        reactionType,
        msg: {
          type: 'success',
          content: 'reação cadastrada com sucesso!',
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Erro ao salvar novo tipo de reação, contate o suporte!',
        },
      });
    }
  }

  findAll() {
    return `This action returns all reactionsTypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reactionsType`;
  }

  update(id: number, updateReactionsTypeDto: UpdateReactionsTypeDto) {
    return `This action updates a #${id} reactionsType`;
  }

  remove(id: number) {
    return `This action removes a #${id} reactionsType`;
  }
}
