import { config } from 'dotenv-safe';
config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
  example: '.env.example',
});

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import sessionStore from 'connect-redis';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import passport from 'passport';
import hbs from 'hbs';
import compression from 'compression';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from 'nestjs-config';
import { getConnectionToken } from '@iac-auth/library/redis/utils';
import { join, resolve } from 'path';
import { HttpExceptionCatcher } from '@iac-auth/core/http';
// import { TransformInterceptor } from '@iac-auth/interceptors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bodyParser: false,
    // logger: ['log'], // log, 'warn', 'error', 'debug', 'verbose'
  });

  const config = app.get(ConfigService);

  // app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionCatcher());

  const secret = config.get('crypto.secret');
  const redis = app.get(getConnectionToken());
  const SessionStore = sessionStore(session);

  app.use(
    session({
      store: new SessionStore({ client: redis }),
      secret,
      resave: true,
      saveUninitialized: false,
    }),
  );

  hbs.registerHelper('json', (ctx: any) => {
    delete ctx.settings;
    delete ctx.cache;
    delete ctx._locals;
    return JSON.stringify(ctx);
  });
  app.set('view engine', 'html');
  app.engine('html', hbs.__express);

  const viewDir = process.env.NODE_ENV === 'development' ? 'dist' : 'views';
  const clientDir = resolve(__dirname, '..', 'client');
  app.setBaseViewsDir(join(clientDir, viewDir));
  app.useStaticAssets(join(clientDir, viewDir));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser(secret));

  if (process.env.NODE_ENV === 'production') {
    app.use(rateLimit(config.get('rate')));
  }

  app.use(helmet());
  app.use(passport.initialize());
  app.use(passport.session());

  if (process.env.NODE_ENV == 'production') {
    app.use(compression());
  }

  app.enableShutdownHooks();

  await app.listen(3000);
}

bootstrap();
