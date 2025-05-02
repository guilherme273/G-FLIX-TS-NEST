import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (category) {
      throw new ConflictException({
        msg: {
          type: 'error',
          content: `Categoria: ${category.name} já cadastrada!`,
        },
      });
    }

    try {
      const categoryCreated =
        await this.categoryRepository.save(createCategoryDto);

      return {
        categoryCreated,
        msg: {
          type: 'success',
          content: `Categoria: ${categoryCreated.name} cadastrada com sucesso!`,
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'erro no servidor ao salvar categoria, contate o suporte!',
        },
      });
    }
  }

  findAll() {
    return `This action returns all category`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
