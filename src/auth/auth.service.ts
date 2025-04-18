import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthDTO } from './auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

export interface TokenUser {
  access_token: string;
  user: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly jwt: JwtService,
  ) {}

  async signIn(data: AuthDTO): Promise<TokenUser> {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (!user) throw new NotFoundException('User not found!');

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Unautorized!');

    const payload = { user: user.id };

    return {
      access_token: await this.jwt.signAsync(payload),
      user: user.id,
    };
  }
}
