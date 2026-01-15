import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UsersQueryService } from '../users/users.query.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../common/enums/user-role.enum';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly query: UsersQueryService,
    private readonly jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({ ...dto, role: dto.role || UserRole.STUDENT });
    return { user: this.usersService.sanitizeUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.query.findByEmail(dto.email);
    if (!user || !(await this.usersService.validatePassword(user, dto.password)))
      throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new UnauthorizedException('Account deactivated');

    return {
      user: this.usersService.sanitizeUser(user),
      accessToken: this.generateToken(user.id, user.email, user.role),
    };
  }

  async getProfile(userId: string) {
    return this.usersService.sanitizeUser(await this.query.findOne(userId));
  }

  async resetPassword(token: string, pass: string) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.query.findByResetToken(hash);
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date())
      throw new UnauthorizedException('Invalid or expired token');

    await this.usersService.update(user.id, {
      password: pass,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    } as any);

    return { message: 'Password reset successfully' };
  }

  private generateToken(userId: string, email: string, role: UserRole): string {
    return this.jwtService.sign({ sub: userId, email, role });
  }
}
