import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { Teacher } from './entities/teacher.entity';
import { createMockRepository } from '../test/test-utils';

describe('TeachersService', () => {
    let service: TeachersService;
    let repo: any;

    const mockTeacher = {
        id: 'teacher-id',
        firstName: 'Test',
        lastName: 'Teacher',
        specialization: 'Math',
        subjects: [],
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TeachersService,
                {
                    provide: getRepositoryToken(Teacher),
                    useValue: createMockRepository(),
                },
            ],
        }).compile();

        service = module.get<TeachersService>(TeachersService);
        repo = module.get(getRepositoryToken(Teacher));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a teacher', async () => {
            const dto = { firstName: 'New', lastName: 'Teacher' } as any;
            repo.create.mockReturnValue(mockTeacher);
            repo.save.mockResolvedValue(mockTeacher);

            const result = await service.create(dto);

            expect(repo.create).toHaveBeenCalledWith(dto);
            expect(repo.save).toHaveBeenCalled();
            expect(result).toEqual(mockTeacher);
        });
    });

    describe('findAll', () => {
        it('should return all teachers', async () => {
            repo.find.mockResolvedValue([mockTeacher]);

            const result = await service.findAll();

            expect(repo.find).toHaveBeenCalledWith({ relations: ['user', 'subjects'] });
            expect(result).toEqual([mockTeacher]);
        });
    });

    describe('findOne', () => {
        it('should return a teacher by id', async () => {
            repo.findOne.mockResolvedValue(mockTeacher);

            const result = await service.findOne('teacher-id');

            expect(repo.findOne).toHaveBeenCalledWith({
                where: { id: 'teacher-id' },
                relations: ['user', 'subjects', 'classesAsTeacher'],
            });
            expect(result).toEqual(mockTeacher);
        });

        it('should throw NotFoundException if not found', async () => {
            repo.findOne.mockResolvedValue(null);

            await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a teacher', async () => {
            repo.findOne.mockResolvedValue(mockTeacher);
            repo.save.mockResolvedValue({ ...mockTeacher, firstName: 'Updated' });

            const result = await service.update('teacher-id', { firstName: 'Updated' } as any);

            expect(repo.save).toHaveBeenCalled();
            expect((result as any).firstName).toEqual('Updated');
        });
    });

    describe('remove', () => {
        it('should remove a teacher', async () => {
            repo.findOne.mockResolvedValue(mockTeacher);
            repo.remove.mockResolvedValue(mockTeacher);

            await service.remove('teacher-id');

            expect(repo.remove).toHaveBeenCalledWith(mockTeacher);
        });
    });

    describe('assignSubjects', () => {
        it('should assign subjects to a teacher', async () => {
            repo.findOne.mockResolvedValue(mockTeacher);
            repo.save.mockImplementation((t) => Promise.resolve(t));

            const result = await service.assignSubjects('teacher-id', ['subject-1', 'subject-2']);

            expect(repo.save).toHaveBeenCalled();
            expect(result.subjects).toHaveLength(2);
            expect(result.subjects[0].id).toEqual('subject-1');
        });
    });
});
