import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserPayload } from 'src/auth/dto/payload.dto';

interface ExpressRequest extends Request {
  user: UserPayload;
}

export const GetUserFromPayload = createParamDecorator(
  (field: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<ExpressRequest>();
    const user = request.user;

    if (!field) {
      return user;
    }

    return user[field];
  },
);
