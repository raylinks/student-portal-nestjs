import { Controller, Get, Put } from '@nestjs/common';

@Controller('teachers/:teacherId/students')
export class StudentTeacherController {

    @Get('')
    getStudents() {

    }

    @Put('studentId')
    updateStudentTeacher() {

    }
}
