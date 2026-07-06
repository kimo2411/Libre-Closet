import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCompress from '@fastify/compress';
import fastifyMultipart from '@fastify/multipart';
import fastifyView from '@fastify/view';
import hbs from 'hbs';
import type { HelperOptions } from 'handlebars';
import { join } from 'path';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ViewContextService } from './view-context/view-context.service';

async function bootstrap() {
  const adapter = new FastifyAdapter({ trustProxy: ['127.0.0.1', '::1'] });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      bufferLogs: true,
    },
  );
  app.useLogger(app.get(Logger));

  const viewContextService = app.get(ViewContextService);
  const fastify = app.getHttpAdapter().getInstance();
  fastify.decorateReply('locals', null);
  fastify.addHook('preHandler', async (req, reply) => {
    reply.locals = await viewContextService.buildContext(req);
  });

  fastify.addHook('onSend', (_request, reply, payload, done) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';",
    );
    done(null, payload);
  });

  await app.register(fastifyCompress);
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 100 * 1024 * 1024,
      files: 100,
    },
  });

  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    decorateReply: false,
  });

  app.setViewEngine({
    engine: { handlebars: hbs },
    templates: join(__dirname, '..', 'views'),
    viewExt: 'hbs',
    layout: 'layout',
    includeViewExtension: true,
  });

  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

  await fastify.register(fastifyView, {
    engine: { handlebars: hbs },
    templates: join(__dirname, '..', 'views'),
    propertyName: 'viewPartial',
    viewExt: 'hbs',
    includeViewExtension: true,
    production: process.env.NODE_ENV === 'production',
  });

  hbs.registerHelper(
    'filterErrors',
    function (
      errors: { property: string; constraints?: Record<string, string> }[],
      property: string,
    ) {
      if (!errors || !Array.isArray(errors)) {
        return;
      }
      return errors
        .filter((error) => error.property === property)
        .flatMap((e) => Object.values(e.constraints || {}));
    },
  );
  hbs.registerHelper('json', function (context: unknown) {
    return JSON.stringify(context);
  });
  hbs.registerHelper(
    'ifEquals',
    function (arg1: unknown, arg2: unknown, options: HelperOptions) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    },
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
