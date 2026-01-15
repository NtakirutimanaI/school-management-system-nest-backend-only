import {
  applyDecorators,
  Controller,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { UserRole } from '../enums/user-role.enum';

export function ApiController(tagName: string) {
  return applyDecorators(
    ApiTags(tagName),
    ApiBearerAuth('JWT-auth'),
    Controller(tagName.toLowerCase()),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}

export function Auth(roles: UserRole[] = []) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}

export function ApiOperationDoc(
  summary: string,
  responseDesc: string = 'Success',
) {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiResponse({ status: 200, description: responseDesc }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}
