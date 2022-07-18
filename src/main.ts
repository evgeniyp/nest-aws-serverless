import 'source-map-support/register';
import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: [
      // 'log', // Disable nest.js startup logs
      'error',
      'warn',
      'debug',
      'verbose',
    ],
  });
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  if (!server) {
    server = await bootstrap();
  }

  // https://github.com/dougmoscrop/serverless-http/issues/86
  event.path = event.path === '' ? '/' : event.path;

  return server(event, context, callback);
};
