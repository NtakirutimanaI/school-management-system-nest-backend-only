import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';

@Processor('users')
export class UserProcessor extends WorkerHost {
    constructor(private mail: MailService, private notifications: NotificationsService) { super(); }
    async process(job: Job) {
        if (job.name === 'send-welcome-email') {
            const { user, token, tempPassword } = job.data;
            await this.mail.sendUserWelcome(user, token, tempPassword);
            await this.notifications.create({
                title: 'Welcome', message: 'Account created. Check email.',
                type: NotificationType.IN_APP, userId: user.id,
            });
        }
    }
}
