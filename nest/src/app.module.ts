import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { SessionService } from './session/session.service';
import { SecurityService } from './security/security.service';
import { PasswordService } from './security/password.service';
import { PilotController } from './pilot/pilot.controller';
import { PilotService } from './pilot/pilot.service';
import { FlightHoursController } from './flight-hours/flight-hours.controller';
import { FlightHoursService } from './flight-hours/flight-hours.service';
import { DocumentsController } from './documents/documents.controller';
import { DocumentsService } from './documents/documents.service';
import { SchedulesController } from './schedules/schedules.controller';
import { SchedulesService } from './schedules/schedules.service';
import { DataLoaderService } from './common/services/data-loader.service';
import { SessionGuard } from './common/guards/session.guard';
import { SecurityMiddleware } from './security/middleware';
import { PrismaService } from './common/services/prisma.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, 
        limit: 100, 
      },
    ]),
  ],
  controllers: [
    AuthController,
    PilotController,
    FlightHoursController,
    DocumentsController,
    SchedulesController,
  ],
  providers: [
    AuthService,
    SessionService,
    SecurityService,
    PasswordService,
    PilotService,
    FlightHoursService,
    DocumentsService,
    SchedulesService,
    DataLoaderService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SessionGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
