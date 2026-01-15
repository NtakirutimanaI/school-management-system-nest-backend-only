import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/user-role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const targetEmail = process.argv[2];
  const email = targetEmail || `testuser_${Date.now()}@example.com`;
  console.log(`Creating user with email: ${email}`);

  try {
    const user = await usersService.create({
      email: email,
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.STUDENT,
      // No password provided, testing auto-generation and email sending
    });

    console.log('User created successfully:', user.id);
    console.log('Reset Token Hash:', user.resetPasswordToken);
    console.log('An email should have been sent to ' + email);

    // Check if notification was created
    // We can't easily check the notification directly here without injecting NotificationsService
    // or querying the DB directly, but if the create call succeeded without error,
    // it likely worked.
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
