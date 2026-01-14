
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { TeachersService } from '../teachers/teachers.service';
import { UserRole } from '../common/enums/user-role.enum';
import { Gender } from '../common/enums/gender.enum';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateTeacherDto } from '../teachers/dto/create-teacher.dto';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const usersService = app.get(UsersService);
        const teachersService = app.get(TeachersService);

        console.log('Seeding Teacher...');

        // 1. Create User
        const createUserDto: CreateUserDto = {
            email: 'teacher.seed@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            role: UserRole.TEACHER,
            phoneNumber: '+1234567890'
        };

        // Check if user exists
        let user = await usersService.findByEmail(createUserDto.email);
        if (!user) {
            user = await usersService.create(createUserDto);
            console.log('User created:', user.id);
        } else {
            console.log('User already exists:', user.id);
        }

        // 2. Create Teacher
        // Check if teacher profile exists (by checking if any teacher has this userId, although the service doesn't have a findByUserId, we can just try to create and catch error if duplicate employeeId or similar)
        // TeachersService.findOne requires teacherId. 
        // We'll trust the unique constraint or just try to create.

        const createTeacherDto: CreateTeacherDto = {
            userId: user.id,
            employeeId: 'EMP-' + Math.floor(Math.random() * 10000), // Random employee ID
            gender: Gender.MALE,
            dateOfBirth: '1985-05-15',
            address: '123 Teacher Lane, Education City',
            qualification: 'Masters in Education',
            specialization: 'Mathematics',
            salary: 50000
        };

        try {
            const teacher = await teachersService.create(createTeacherDto);
            console.log('Teacher created:', teacher.id);
            console.log('Teacher Details:', teacher);
        } catch (error) {
            console.error('Error creating teacher (might already exist):', error.message);
        }

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
