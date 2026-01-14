import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const user = await this.usersService.create({
            ...registerDto,
            role: registerDto.role || UserRole.STUDENT,
        });

        const { password, ...result } = user;
        return {
            user: result,
            accessToken: this.generateToken(user.id, user.email, user.role),
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await this.usersService.validatePassword(
            user,
            loginDto.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        const { password, ...result } = user;
        return {
            user: result,
            accessToken: this.generateToken(user.id, user.email, user.role),
        };
    }

    async getProfile(userId: string) {
        const user = await this.usersService.findOne(userId);
        const { password, ...result } = user;
        return result;
    }

    private generateToken(userId: string, email: string, role: UserRole): string {
        const payload = { sub: userId, email, role };
        return this.jwtService.sign(payload);
    }
}
