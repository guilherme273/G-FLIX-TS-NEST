import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthDTO } from './auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly jwt: JwtService,
  ) {}

  async signIn(data: AuthDTO) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (!user) {
      return {
        msg: { type: 'error', content: 'Usuário não encontrado!' },
      };
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return {
        msg: { type: 'error', content: 'Usuário ou senha inválidos!' },
      };
    }

    const payload = { user: user.id };

    return {
      access_token: await this.jwt.signAsync(payload),
      user: user.id,
      msg: { type: 'success', content: `Seja bem-vindo, ${user.name}!` },
    };
  }
}
