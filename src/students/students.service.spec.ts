import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { createMockRepository } from '../test/test-utils';

describe('StudentsService', () => {
    let service: StudentsService;
    let repo: any;
    let cloudinaryService: any;

    const mockCloudinaryService = {
        uploadFile: jest.fn(),
        deleteFile: jest.fn(),
    };

    const mockStudent = {
        id: 'student-id',
        firstName: 'Test',
        lastName: 'Student',
        classId: 'class-id',
        profilePictureUrl: 'https://cloudinary.com/old-pic.jpg',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StudentsService,
                {
                    provide: getRepositoryToken(Student),
                    useValue: createMockRepository(),
                },
                {
                    provide: CloudinaryService,
                    useValue: mockCloudinaryService,
                },
            ],
        }).compile();

        service = module.get<StudentsService>(StudentsService);
        repo = module.get(getRepositoryToken(Student));
        cloudinaryService = module.get(CloudinaryService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a student', async () => {
            const dto = { firstName: 'New', lastName: 'Student' } as any;
            repo.create.mockReturnValue(mockStudent);
            repo.save.mockResolvedValue(mockStudent);

            const result = await service.create(dto);

            expect(repo.create).toHaveBeenCalledWith(dto);
            expect(repo.save).toHaveBeenCalled();
            expect(result).toEqual(mockStudent);
        });
    });

    describe('findAll', () => {
        it('should return all students', async () => {
            repo.find.mockResolvedValue([mockStudent]);

            const result = await service.findAll();

            expect(repo.find).toHaveBeenCalledWith({ relations: ['user', 'class'] });
            expect(result).toEqual([mockStudent]);
        });
    });

    describe('findOne', () => {
        it('should return a student by id', async () => {
            repo.findOne.mockResolvedValue(mockStudent);

            const result = await service.findOne('student-id');

            expect(repo.findOne).toHaveBeenCalledWith({
                where: { id: 'student-id' },
                relations: ['user', 'class', 'enrollments'],
            });
            expect(result).toEqual(mockStudent);
        });

        it('should throw NotFoundException if not found', async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a student', async () => {
            repo.findOne.mockResolvedValue(mockStudent);
            repo.save.mockResolvedValue({ ...mockStudent, firstName: 'Updated' });

            const result = await service.update('student-id', { firstName: 'Updated' } as any);

            expect(repo.save).toHaveBeenCalled();
            expect((result as any).firstName).toEqual('Updated');
        });
    });

    describe('remove', () => {
        it('should remove a student', async () => {
            repo.findOne.mockResolvedValue(mockStudent);
            repo.remove.mockResolvedValue(mockStudent);

            await service.remove('student-id');

            expect(repo.remove).toHaveBeenCalledWith(mockStudent);
        });
    });

    describe('uploadProfilePicture', () => {
        const mockFile = {
            mimetype: 'image/jpeg',
            buffer: Buffer.from('test'),
        } as any;

        it('should upload profile picture', async () => {
            repo.findOne.mockResolvedValue(mockStudent);
            cloudinaryService.uploadFile.mockResolvedValue({ secure_url: 'new-url.jpg' });
            repo.save.mockImplementation((student) => Promise.resolve(student));

            const result = await service.uploadProfilePicture('student-id', mockFile);

            expect(cloudinaryService.uploadFile).toHaveBeenCalled();
            expect(repo.save).toHaveBeenCalled();
            expect(result.profilePictureUrl).toEqual('new-url.jpg');
        });

        it('should delete old picture if exists', async () => {
            repo.findOne.mockResolvedValue({ ...mockStudent, profilePictureUrl: 'old.jpg' });
            cloudinaryService.uploadFile.mockResolvedValue({ secure_url: 'new.jpg' });
            repo.save.mockImplementation((s) => Promise.resolve(s));

            await service.uploadProfilePicture('student-id', mockFile);

            expect(cloudinaryService.deleteFile).toHaveBeenCalled();
        });

        it('should throw BadRequestException for invalid file type', async () => {
            repo.findOne.mockResolvedValue(mockStudent);
            const badFile = { mimetype: 'text/plain' } as any;

            await expect(service.uploadProfilePicture('student-id', badFile)).rejects.toThrow(BadRequestException);
        });
    });
});
