import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, TokenUser } from './auth.service';
import { AuthDTO } from './auth.dto';

@Controller()
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('signin')
  async signIn(@Body() data: AuthDTO): Promise<TokenUser> {
    return this.AuthService.signIn(data);
  }
}
