import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FeesService } from './fees.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { FeesQueryService } from './fees.query.service';

@ApiTags('Fees')
@ApiBearerAuth('JWT-auth')
@Controller('fees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeesController {
  constructor(private readonly service: FeesService, private readonly query: FeesQueryService) { }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT)
  createFee(@Body() dto: CreateFeeDto) { return this.service.createFee(dto); }

  @Get()
  findAllFees() { return this.service.findAllFees(); }

  @Get(':id')
  findOneFee(@Param('id', ParseUUIDPipe) id: string) { return this.query.findOneFee(id); }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT)
  updateFee(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFeeDto) { return this.service.updateFee(id, dto); }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  removeFee(@Param('id', ParseUUIDPipe) id: string) { return this.service.removeFee(id); }

  @Post('payments')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT)
  createPayment(@Body() dto: CreatePaymentDto) { return this.service.createPayment(dto); }

  @Get('payments/all')
  findAllPayments() { return this.service.findAllPayments(); }

  @Get('payments/:id')
  findOnePayment(@Param('id', ParseUUIDPipe) id: string) { return this.query.findOnePayment(id); }

  @Patch('payments/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT)
  updatePayment(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePaymentDto) { return this.service.updatePayment(id, dto); }

  @Get('status/:studentId')
  getStudentFeeStatus(@Param('studentId', ParseUUIDPipe) id: string, @Query('academicYear') y: string) {
    return this.query.getStudentStatus(id, y);
  }
}
