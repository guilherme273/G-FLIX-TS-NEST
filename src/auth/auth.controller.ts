import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('signin')
  async signIn(@Body() data) {
    return this.AuthService.signIn(data);
  }
}
