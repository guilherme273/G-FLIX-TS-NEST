import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { validationSchema } from './config/validation';
import { CategoryModule } from './category/category.module';
import { MovieModule } from './movie/movie.module';
import { ReactionsTypesModule } from './reactions_types/reactions_types.module';
import { ReactionsModule } from './reactions/reactions.module';
import { FavoritesModule } from './favorites/favorites.module';
import { AdminModule } from './admin/admin.module';
import { ViewModule } from './view/view.module';

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
    CategoryModule,
    MovieModule,
    ReactionsTypesModule,
    ReactionsModule,
    FavoritesModule,
    AdminModule,
    ViewModule,
  ],

  controllers: [],

  providers: [],
})
export class AppModule {}
