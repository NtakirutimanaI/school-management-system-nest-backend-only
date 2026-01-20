import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/user-role.enum';
import { UsersQueryService } from '../users/users.query.service';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
    // Pass logger: false to silence normal bootstrap logs during seeding
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn'],
    });

    try {
        const usersService = app.get(UsersService);
        const usersQuery = app.get(UsersQueryService);

        console.log('🌱 Starting database seed for default users...\n');

        // Define user data without CreateUserDto initially to allow description
        // @ts-ignore
        const usersToSeed = [
            {
                email: 'admin@school.com',
                firstName: 'Admin',
                lastName: 'User',
                role: UserRole.SUPER_ADMIN,
                password: 'password123',
                description: 'Super Administrator with full access',
            },
            {
                email: 'headmaster@school.com',
                firstName: 'Mister',
                lastName: 'Headmaster',
                role: UserRole.HEADMASTER,
                password: 'password123',
                description: 'School Headmaster (Overall oversight)',
            },
            {
                email: 'dos@school.com',
                firstName: 'Director',
                lastName: 'Studies',
                role: UserRole.DOS,
                password: 'password123',
                description: 'Director of Studies (Academic oversight)',
            },
            {
                email: 'dod@school.com',
                firstName: 'Director',
                lastName: 'Discipline',
                role: UserRole.DOD,
                password: 'password123',
                description: 'Director of Discipline (Student conduct)',
            },
            {
                email: 'admin-staff@school.com',
                firstName: 'Admin',
                lastName: 'Staff',
                role: UserRole.ADMIN,
                password: 'password123',
                description: 'Regular Administrative Staff',
            },
            {
                email: 'teacher@school.com',
                firstName: 'Jane',
                lastName: 'Teacher',
                role: UserRole.TEACHER,
                password: 'password123',
                description: 'Teacher with access to classes and assessments',
            },
            {
                email: 'accountant@school.com',
                firstName: 'Finance',
                lastName: 'Manager',
                role: UserRole.ACCOUNTANT,
                password: 'password123',
                description: 'Accountant managing fees and payments'
            },
            {
                email: 'receptionist@school.com',
                firstName: 'Front',
                lastName: 'Desk',
                role: UserRole.RECEPTIONIST,
                password: 'password123',
                description: 'Receptionist at the front desk'
            },
            {
                email: 'librarian@school.com',
                firstName: 'Library',
                lastName: 'Manager',
                role: UserRole.LIBRARIAN,
                password: 'password123',
                description: 'Librarian managing school resources'
            },
            {
                email: 'student@school.com',
                firstName: 'Student',
                lastName: 'One',
                role: UserRole.STUDENT,
                password: 'password123',
                description: 'Student with access to grades and materials',
            },
            {
                email: 'parent@school.com',
                firstName: 'John',
                lastName: 'Parent',
                role: UserRole.PARENT,
                password: 'password123',
                description: 'Parent monitoring student progress'
            }
        ];

        const results: any[] = [];

        for (const userData of usersToSeed) {
            let user = await usersQuery.findByEmail(userData.email);

            if (!user) {
                // Create new user - explicitly construct DTO to match CreateUserDto
                // @ts-ignore
                user = await usersService.create({
                    email: userData.email,
                    password: userData.password,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: userData.role,
                }); // Cast as any because create expects specific DTO but we're passing extra checks internally
                results.push({ ...userData, status: 'Created ✅' });
            } else {
                results.push({ ...userData, status: 'Already Exists ℹ️' });
            }
        }

        console.table(
            results.map((r) => ({
                Role: r.role,
                Email: r.email,
                Password: r.password,
                Status: r.status,
                Description: r.description,
            })),
        );

        console.log('\n✨ Database seeding completed.');
        console.log('📌 NOTE: Use these credentials to login at http://localhost:5173');
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
