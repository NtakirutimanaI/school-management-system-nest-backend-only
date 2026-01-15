import { IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateResultDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  examId: string;

  @IsNumber()
  @Min(0)
  marksObtained: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
