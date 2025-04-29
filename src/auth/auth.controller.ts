import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
  @Get('auth')
  loggedIn() {
    return true;
  }
}
