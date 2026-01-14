import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'Welcome to School Management System API',
      version: '1.0.0',
      documentation: '/api/docs',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        students: '/api/students',
        teachers: '/api/teachers',
        classes: '/api/classes',
        subjects: '/api/subjects',
        enrollments: '/api/enrollments',
        attendance: '/api/attendance',
        exams: '/api/exams',
        results: '/api/results',
        fees: '/api/fees',
        notifications: '/api/notifications',
      },
    };
  }
}
