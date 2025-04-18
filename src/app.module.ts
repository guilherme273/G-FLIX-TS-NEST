import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development.local',
      isGlobal: true,
      validationSchema,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [`${__dirname}/**/*.entity{.ts,.js}`],
      migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
      migrationsRun: true,
    }),

    UserModule,
    AuthModule,
  ],

  controllers: [],

  providers: [],
})
export class AppModule {}
