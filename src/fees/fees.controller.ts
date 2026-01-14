import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { FeesService } from './fees.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Fees')
@ApiBearerAuth('JWT-auth')
@Controller('fees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeesController {
    constructor(private readonly feesService: FeesService) { }

    // Fee endpoints
    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT)
    @ApiOperation({ summary: 'Create a new fee structure' })
    @ApiResponse({ status: 201, description: 'Fee successfully created' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    createFee(@Body() createFeeDto: CreateFeeDto) {
        return this.feesService.createFee(createFeeDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all fee structures' })
    @ApiResponse({ status: 200, description: 'Returns list of fees' })
    findAllFees() {
        return this.feesService.findAllFees();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get fee by ID' })
    @ApiParam({ name: 'id', description: 'Fee UUID' })
    @ApiResponse({ status: 200, description: 'Returns the fee' })
    @ApiResponse({ status: 404, description: 'Fee not found' })
    findOneFee(@Param('id', ParseUUIDPipe) id: string) {
        return this.feesService.findOneFee(id);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT)
    @ApiOperation({ summary: 'Update fee by ID' })
    @ApiParam({ name: 'id', description: 'Fee UUID' })
    @ApiResponse({ status: 200, description: 'Fee successfully updated' })
    @ApiResponse({ status: 404, description: 'Fee not found' })
    updateFee(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateFeeDto: UpdateFeeDto,
    ) {
        return this.feesService.updateFee(id, updateFeeDto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Delete fee by ID' })
    @ApiParam({ name: 'id', description: 'Fee UUID' })
    @ApiResponse({ status: 200, description: 'Fee successfully deleted' })
    @ApiResponse({ status: 404, description: 'Fee not found' })
    removeFee(@Param('id', ParseUUIDPipe) id: string) {
        return this.feesService.removeFee(id);
    }

    // Payment endpoints
    @Post('payments')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT)
    @ApiOperation({ summary: 'Record a fee payment' })
    @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    createPayment(@Body() createPaymentDto: CreatePaymentDto) {
        return this.feesService.createPayment(createPaymentDto);
    }

    @Get('payments/all')
    @ApiOperation({ summary: 'Get all payments' })
    @ApiResponse({ status: 200, description: 'Returns list of payments' })
    findAllPayments() {
        return this.feesService.findAllPayments();
    }

    @Get('payments/:id')
    @ApiOperation({ summary: 'Get payment by ID' })
    @ApiParam({ name: 'id', description: 'Payment UUID' })
    @ApiResponse({ status: 200, description: 'Returns the payment' })
    @ApiResponse({ status: 404, description: 'Payment not found' })
    findOnePayment(@Param('id', ParseUUIDPipe) id: string) {
        return this.feesService.findOnePayment(id);
    }

    @Get('payments/student/:studentId')
    @ApiOperation({ summary: 'Get all payments for a student' })
    @ApiParam({ name: 'studentId', description: 'Student UUID' })
    @ApiResponse({ status: 200, description: 'Returns student payments' })
    findPaymentsByStudent(@Param('studentId', ParseUUIDPipe) studentId: string) {
        return this.feesService.findPaymentsByStudent(studentId);
    }

    @Patch('payments/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT)
    @ApiOperation({ summary: 'Update payment by ID' })
    @ApiParam({ name: 'id', description: 'Payment UUID' })
    @ApiResponse({ status: 200, description: 'Payment successfully updated' })
    @ApiResponse({ status: 404, description: 'Payment not found' })
    updatePayment(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updatePaymentDto: UpdatePaymentDto,
    ) {
        return this.feesService.updatePayment(id, updatePaymentDto);
    }

    @Get('status/:studentId')
    @ApiOperation({ summary: 'Get fee status for a student' })
    @ApiParam({ name: 'studentId', description: 'Student UUID' })
    @ApiQuery({ name: 'academicYear', required: true, description: 'Academic year (e.g., 2024-2025)' })
    @ApiResponse({ status: 200, description: 'Returns student fee status' })
    getStudentFeeStatus(
        @Param('studentId', ParseUUIDPipe) studentId: string,
        @Query('academicYear') academicYear: string,
    ) {
        return this.feesService.getStudentFeeStatus(studentId, academicYear);
    }
}
