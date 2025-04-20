import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userReposytory: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userReposytory.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      return {
        msg: {
          type: 'error',
          content: `Email: ${existingUser.email} já cadastrado!`,
        },
      };
    }

    const password = await hash(createUserDto.password, 15);
    const user = this.userReposytory.create({
      ...createUserDto,
      password: password,
      type: 0,
    });

    const savedUser = await this.userReposytory.save(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = savedUser;
    return {
      ...userWithoutPassword,
      msg: {
        type: 'success',
        content: `${savedUser.name} cadastrado com sucesso!`,
      },
    };
  }

  async findAll() {
    return await this.userReposytory.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
