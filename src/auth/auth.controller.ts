import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto/auth.dto';

import { AuthGuard } from './auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('signin')
  async signIn(@Body() data: AuthDTO) {
    return this.AuthService.signIn(data);
  }

  @UseGuards(AuthGuard)
  @Post('isAtuhenticated')
  isAtuhenticated() {
    return this.AuthService.isAtuhenticated();
  }
}
