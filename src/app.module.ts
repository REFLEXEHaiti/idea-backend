// src/app.module.ts
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import configuration from './config/configuration';

import { PrismaModule }        from './prisma/prisma.module';
import { TenantsModule }       from './tenants/tenants.module';
import { AuthModule }          from './auth/auth.module';
import { UsersModule }         from './users/users.module';
import { ProfilsModule }       from './profils/profils.module';
import { CoursModule }         from './cours/cours.module';
import { LeconsModule }        from './lecons/lecons.module';
import { QuizModule }          from './quiz/quiz.module';
import { LivesModule }         from './lives/lives.module';
import { DebatsModule }        from './debats/debats.module';
import { MessagesModule }      from './messages/messages.module';
import { VotesModule }         from './votes/votes.module';
import { TournoisModule }      from './tournois/tournois.module';
import { GamificationModule }  from './gamification/gamification.module';
import { IaModule }            from './ia/ia.module';
import { PaiementsModule }     from './paiements/paiements.module';
import { SponsoringModule }    from './sponsoring/sponsoring.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule }     from './analytics/analytics.module';
import { WebsocketModule }     from './websocket/websocket.module';

import { TenantMiddleware }   from './middleware/tenant.middleware';
import { TenantIdMiddleware } from './middleware/tenant-id.middleware';

@Module({
  providers: [TenantIdMiddleware],
  imports: [
    ConfigModule.forRoot({
      isGlobal:    true,
      load:        [configuration],
      envFilePath: '.env',
    }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    CacheModule.registerAsync({
      isGlobal:   true,
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: () => ({ ttl: 60, max: 100 }),
    }),

    PrismaModule,
    TenantsModule,
    AuthModule,
    UsersModule,
    ProfilsModule,
    CoursModule,
    LeconsModule,
    QuizModule,
    LivesModule,
    DebatsModule,
    MessagesModule,
    VotesModule,
    TournoisModule,
    GamificationModule,
    IaModule,
    PaiementsModule,
    SponsoringModule,
    NotificationsModule,
    AnalyticsModule,
    WebsocketModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware, TenantIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
