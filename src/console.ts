import { config } from 'dotenv-safe';
config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
  example: '.env.example',
});

import { BootstrapConsole } from 'nestjs-console';
import { ConsoleCliModule } from '@iac-auth/core/console';

const bootstrap = new BootstrapConsole({
  module: ConsoleCliModule,
  useDecorators: true,
  contextOptions: {
    logger: ['error'],
  },
});

bootstrap.init().then(async application => {
  try {
    await application.init();
    await bootstrap.boot(process.argv);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
