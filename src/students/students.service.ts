import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const student = this.studentRepository.create(createStudentDto);
    return this.studentRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return this.studentRepository.find({
      relations: ['user', 'class'],
    });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['user', 'class', 'enrollments'],
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async findByUserId(userId: string): Promise<Student | null> {
    return this.studentRepository.findOne({
      where: { userId },
      relations: ['user', 'class'],
    });
  }

  async findByClass(classId: string): Promise<Student[]> {
    return this.studentRepository.find({
      where: { classId },
      relations: ['user'],
    });
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const student = await this.findOne(id);
    Object.assign(student, updateStudentDto);
    return this.studentRepository.save(student);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async assignToClass(id: string, classId: string): Promise<Student> {
    const student = await this.findOne(id);
    student.classId = classId;
    return this.studentRepository.save(student);
  }

  async uploadProfilePicture(id: string, file: Express.Multer.File): Promise<Student> {
    const student = await this.findOne(id);

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files (JPEG, PNG, GIF, WebP) are allowed');
    }

    // Delete old profile picture if exists
    if (student.profilePictureUrl) {
      try {
        // Extract public_id from URL
        const urlParts = student.profilePictureUrl.split('/');
        const publicIdWithExtension = urlParts.slice(-2).join('/');
        const publicId = publicIdWithExtension.split('.')[0];
        await this.cloudinaryService.deleteFile(publicId, 'image');
      } catch (error) {
        console.error('Failed to delete old profile picture:', error);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new profile picture
    const result = await this.cloudinaryService.uploadFile(
      file,
      `students/${id}/profile`,
      'image',
    );

    // Update student record with new URL
    student.profilePictureUrl = result.secure_url;
    return this.studentRepository.save(student);
  }
}
