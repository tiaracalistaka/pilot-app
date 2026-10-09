import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SecurityMiddleware } from './security/middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  app.use(helmet({
    contentSecurityPolicy: !isProduction ? false : undefined,
  }));

  app.use(cookieParser());

  app.use(new SecurityMiddleware().use);

  const corsOrigins = (process.env.CORS_ORIGIN || '*').split(',');
  app.enableCors({
    origin: isProduction ? corsOrigins : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['X-Request-Id'],
    credentials: true,
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.use((req: any, res: any, next: any) => {
    req.requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    res.setHeader('X-Request-Id', req.requestId);
    next();
  });

  if (process.env.TZ) {
    process.env.TZ = process.env.TZ;
  }

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Susi Air Pilot API                                   ║
║   Environment: ${nodeEnv.padEnd(43)}║
║   Port: ${String(port).padEnd(50)}║
║   Timezone: ${(process.env.TZ || 'UTC').padEnd(46)}║
║   Security: Cookie Session + Security Headers            ║
╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
