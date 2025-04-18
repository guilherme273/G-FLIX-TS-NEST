import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });
  console.log('PORT-SYSTEM', process.env.SYSTEMPORT);
  console.log('token:', process.env.JWT_TOKEN);
  await app.listen(process.env.SYSTEMPORT ?? 3000);
}
bootstrap().catch((e) => console.log(e));
