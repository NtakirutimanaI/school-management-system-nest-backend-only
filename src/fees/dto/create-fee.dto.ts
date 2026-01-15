import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateFeeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  academicYear: string;

  @IsDateString()
  dueDate: string;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @IsUUID()
  @IsOptional()
  classId?: string;
}
