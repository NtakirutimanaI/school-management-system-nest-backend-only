import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'newPassword123',
    description: 'New password for the account',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    example: 'abcdef123456...',
    description: 'Reset token provided via email',
  })
  @IsString()
  token: string;
}
