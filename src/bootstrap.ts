import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import { useContainer } from 'typeorm';

const rawBodyBuffer = (req, res, buffer, encoding) => {
  if (!req.headers['stripe-signature']) {
    return;
  }

  if (buffer && buffer.length) {
    req['rawBody'] = buffer.toString(encoding || 'utf8');
  }
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
  app.use(bodyParser.json({ verify: rawBodyBuffer }));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const configService = app.get(ConfigService);
  const appPort = configService.get<number>('app.port');
  const appHost = configService.get<string>('app.host');

  app.set('trust proxy', 1);

  app.enableCors({
    origin: configService.get('app.corsOrigins'),
  });

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  const logger = app.get(Logger);

  app.useLogger(logger);

  const config = new DocumentBuilder()
    .setTitle('ColdStack Billing Dashboard')
    .setDescription('No one rocks only rocks are rocks')
    .setVersion('1.0')
    .addTag('Coldstack')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(appPort, appHost, () => {
    logger.log(`The server is listening on http://${appHost}:${appPort}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
