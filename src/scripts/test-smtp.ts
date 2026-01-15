import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';

async function bootstrap() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.error('Please provide an email address as an argument.');
    console.error('Usage: npx ts-node src/scripts/test-smtp.ts <email>');
    process.exit(1);
  }

  console.log(`Initializing NestJS application...`);
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const mailService = app.get(MailService);
    console.log(`Sending test email to: ${targetEmail}`);

    // Create a mock user
    const mockUser = new User();
    mockUser.email = targetEmail;
    mockUser.firstName = 'Test User';

    // Mock token
    const mockToken = 'test-reset-token-12345';

    await mailService.sendUserWelcome(mockUser, mockToken);

    console.log('✅ Email sent successfully!');
    console.log(
      'Please check your inbox (and spam folder) for the "Welcome" email.',
    );
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
