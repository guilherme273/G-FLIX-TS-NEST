import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_TOKEN'),
        signOptions: { expiresIn: '100000s' },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
