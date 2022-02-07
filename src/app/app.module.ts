import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AtGuard } from 'src/common/guards';
import { APP_GUARD } from '@nestjs/core';



@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, PrismaModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard
    }
  ],
})
export class AppModule { }
