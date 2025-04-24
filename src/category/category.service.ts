import { Injectable } from '@nestjs/common';
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
      return {
        msg: {
          type: 'error',
          content: `Categoria: ${category.name} já cadastrada!`,
        },
      };
    }

    const categoryCreated =
      await this.categoryRepository.save(createCategoryDto);

    return {
      categoryCreated,
      msg: {
        type: 'success',
        content: `Categoria: ${categoryCreated.name} cadastrada com sucesso!`,
      },
    };
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
