import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  async sendUserWelcome(user: User, token: string, tempPassword?: string) {
    const url = `http://localhost:3000/api/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Account Activation - Academic Cloud',
      template: './welcome', // `.hbs` extension is appended automatically
      context: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        password: tempPassword || '*******',
        url,
      },
    });
  }
}
