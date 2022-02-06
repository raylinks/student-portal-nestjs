import { Module } from '@nestjs/common';
import { StudentController } from '../student/student.controller';
import { TeacherController } from '../teacher/teacher.controller';
import { StudentTeacherController } from '../teacher/student.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AtGuard } from 'src/common/guards';
import { APP_GUARD } from '@nestjs/core';



@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [StudentController, TeacherController, StudentTeacherController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard
    }
  ],
})
export class AppModule { }
