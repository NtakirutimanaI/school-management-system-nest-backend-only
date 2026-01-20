import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, Min, Max, IsOptional } from 'class-validator';
import { AssessmentType, AssessmentCategory } from '../../common/enums/assessment-type.enum';
import { Term } from '../../common/enums/education-system.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssessmentDto {
    @ApiProperty({ example: 'Quiz 1' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ enum: AssessmentType })
    @IsEnum(AssessmentType)
    type: AssessmentType;

    @ApiProperty({ enum: AssessmentCategory, required: false })
    @IsOptional()
    @IsEnum(AssessmentCategory)
    category?: AssessmentCategory;

    @ApiProperty({ example: 20 })
    @IsNumber()
    @Min(0)
    maxMarks: number;

    @ApiProperty({ example: 10, required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    weightage?: number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    academicYear: string;

    @ApiProperty({ enum: Term })
    @IsEnum(Term)
    term: Term;

    @ApiProperty()
    @IsUUID()
    subjectId: string;

    @ApiProperty()
    @IsUUID()
    classId: string;
}
