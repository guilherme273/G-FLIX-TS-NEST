import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException({
        msg: {
          type: 'error',
          content: `Email: ${existingUser.email} já cadastrado!`,
        },
      });
    }

    try {
      const password = await hash(createUserDto.password, 15);
      const user = this.userRepository.create({
        ...createUserDto,
        password: password,
        type: 0,
      });

      const savedUser = await this.userRepository.save(user);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = savedUser;
      return {
        ...userWithoutPassword,
        msg: {
          type: 'success',
          content: `${savedUser.name} cadastrado com sucesso!`,
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        msg: {
          type: 'error',
          content: 'Erro ao salvar usuário, contate o suporte!',
        },
      });
    }
  }

  async updatePassword(
    updateUserPasswordDto: UpdateUserPasswordDto,
    user_id: number,
  ) {
    const user = await this.userRepository.findOne({ where: { id: user_id } });

    if (!user) {
      throw new NotFoundException({
        msg: { type: 'error', content: 'Usuário Não encontrado!' },
      });
    }

    const isMatch = await bcrypt.compare(
      updateUserPasswordDto.oldPassword,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException({
        msg: { type: 'error', content: 'Senha Atual Inválida!' },
      });
    }

    const newPassword = await hash(updateUserPasswordDto.newPassword, 15);
    user.password = newPassword;
    await this.userRepository.save(user);

    return {
      msg: {
        type: 'success',
        content: 'Senha atualizada com sucesso!',
      },
    };
  }

  async findAll() {
    const users = await this.userRepository.find();
    return {
      users,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      select: ['id', 'name', 'email', 'type'],
      where: { id },
    });

    if (!user) {
      throw new NotFoundException({
        msg: { type: 'error', content: 'Usuário não encontrado!' },
      });
    }

    return {
      user,
    };
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
