import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersQueryService } from './users.query.service';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly query: UsersQueryService,
    @InjectQueue('users') private readonly userQueue: Queue,
    private readonly mailService: MailService,
  ) { }

  async create(dto: CreateUserDto): Promise<User> {
    if (await this.query.findByEmail(dto.email)) throw new ConflictException('Email exists');
    if (dto.phoneNumber && await this.query.findByPhoneNumber(dto.phoneNumber)) {
      throw new ConflictException('Phone number exists');
    }

    const { password, resetTokenHash, resetToken, tempPassword } = await this.prepareCreds();
    const user = this.repo.create({
      ...dto,
      password,
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: new Date(Date.now() + 2 * 60 * 60 * 1000),
    });
    const saved = await this.repo.save(user);

    // Skip queue if using mock
    if (process.env.USE_REDIS_MOCK !== 'true') {
      try {
        const plainUser = { ...saved, createdAt: saved.createdAt.toISOString(), updatedAt: saved.updatedAt.toISOString() };
        await this.userQueue.add('send-welcome-email', { user: plainUser, token: resetToken, tempPassword });
      } catch (e) {
        console.error('Failed to queue welcome email:', e.message);
      }
    } else {
      // Mock mode: Send email directly
      try {
        await this.mailService.sendUserWelcome(saved, resetToken, tempPassword);
      } catch (e) {
        console.error('Failed to send welcome email directly:', e.message);
      }
    }

    return saved;
  }

  private async prepareCreds() {
    const tempPassword = crypto.randomBytes(12).toString('hex');
    const password = await bcrypt.hash(tempPassword, 10);
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    return { password, resetTokenHash, resetToken, tempPassword };
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.query.findOne(id);
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.repo.remove(await this.query.findOne(id));
  }

  async validatePassword(user: User, pass: string): Promise<boolean> {
    return bcrypt.compare(pass, user.password);
  }

  sanitizeUser(user: User) {
    const { password, resetPasswordToken, resetPasswordExpires, ...sanitized } = user;
    return sanitized;
  }
}
