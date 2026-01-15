import { Controller, Post, Body, Get, UseGuards, Query, Render } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth') @Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) { }

  @Post('register')
  register(@Body() dto: RegisterDto) { return this.service.register(dto); }

  @Post('login')
  login(@Body() dto: LoginDto) { return this.service.login(dto); }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) { return this.service.resetPassword(dto.token, dto.password); }

  @Get('reset-password') @Render('reset-password')
  verifyResetToken(@Query('token') token: string) { return { token }; }

  @Get('profile') @UseGuards(JwtAuthGuard) @ApiBearerAuth('JWT-auth')
  getProfile(@CurrentUser() user: any) { return this.service.getProfile(user.id); }
}
