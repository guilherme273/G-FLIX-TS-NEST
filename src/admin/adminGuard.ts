import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserPayload } from 'src/auth/dto/payload.dto';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userPayload = request['user'] as UserPayload;

    if (!userPayload) {
      throw new UnauthorizedException({
        msg: { type: 'error', content: 'Um token é requerido para esta rota!' },
      });
    }

    const userId = userPayload.sub;

    if (!userId) {
      throw new UnauthorizedException({
        msg: {
          type: 'error',
          content: 'Um token válido é requerido para esta rota!',
        },
      });
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException({
        msg: {
          type: 'error',
          content: 'Usuário não encontrado!',
        },
      });
    }

    if (user.type !== 1) {
      throw new UnauthorizedException({
        msg: {
          type: 'error',
          content: 'Acesso negado!',
        },
      });
    }

    return true;
  }
}
