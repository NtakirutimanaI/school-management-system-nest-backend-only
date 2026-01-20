import {
    Injectable,
    ConflictException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School, SubscriptionStatus } from './entities/school.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
    constructor(
        @InjectRepository(School)
        private readonly schoolRepository: Repository<School>,
    ) { }

    /**
     * Create a new school
     */
    async create(dto: CreateSchoolDto): Promise<School> {
        // Check for duplicate subdomain
        const existingSubdomain = await this.schoolRepository.findOne({
            where: { subdomain: dto.subdomain },
        });
        if (existingSubdomain) {
            throw new ConflictException('Subdomain already exists');
        }

        // Check for duplicate email
        const existingEmail = await this.schoolRepository.findOne({
            where: { email: dto.email },
        });
        if (existingEmail) {
            throw new ConflictException('Email already exists');
        }

        // Generate unique school code
        const code = await this.generateSchoolCode(dto.name);

        // Set trial period (14 days)
        const subscriptionStartedAt = new Date();
        const subscriptionExpiresAt = new Date();
        subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + 14);

        const school = this.schoolRepository.create({
            ...dto,
            code,
            subscriptionStatus: SubscriptionStatus.TRIAL,
            subscriptionStartedAt,
            subscriptionExpiresAt,
        });

        return this.schoolRepository.save(school);
    }

    /**
     * Find all schools with pagination
     */
    async findAll(
        page = 1,
        limit = 10,
        filters?: {
            subscriptionStatus?: SubscriptionStatus;
            isActive?: boolean;
            search?: string;
        },
    ): Promise<{ data: School[]; total: number; page: number; limit: number }> {
        const query = this.schoolRepository.createQueryBuilder('school');

        if (filters?.subscriptionStatus) {
            query.andWhere('school.subscriptionStatus = :status', {
                status: filters.subscriptionStatus,
            });
        }

        if (filters?.isActive !== undefined) {
            query.andWhere('school.isActive = :isActive', {
                isActive: filters.isActive,
            });
        }

        if (filters?.search) {
            query.andWhere(
                '(school.name ILIKE :search OR school.code ILIKE :search OR school.email ILIKE :search)',
                { search: `%${filters.search}%` },
            );
        }

        query.orderBy('school.createdAt', 'DESC');

        const total = await query.getCount();
        const data = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        return { data, total, page, limit };
    }

    /**
     * Find school by ID
     */
    async findOne(id: string): Promise<School> {
        const school = await this.schoolRepository.findOne({
            where: { id },
            // TODO: Add relations after adding schoolId to entities
            // relations: ['users', 'students', 'teachers', 'classes'],
        });

        if (!school) {
            throw new NotFoundException('School not found');
        }

        return school;
    }

    /**
     * Find school by code
     */
    async findByCode(code: string): Promise<School> {
        const school = await this.schoolRepository.findOne({ where: { code } });

        if (!school) {
            throw new NotFoundException('School not found');
        }

        return school;
    }

    /**
     * Find school by subdomain
     */
    async findBySubdomain(subdomain: string): Promise<School> {
        const school = await this.schoolRepository.findOne({
            where: { subdomain },
        });

        if (!school) {
            throw new NotFoundException('School not found');
        }

        return school;
    }

    /**
     * Update school
     */
    async update(id: string, dto: UpdateSchoolDto): Promise<School> {
        const school = await this.findOne(id);

        // Check subdomain uniqueness if changed
        if (dto.subdomain && dto.subdomain !== school.subdomain) {
            const existing = await this.schoolRepository.findOne({
                where: { subdomain: dto.subdomain },
            });
            if (existing) {
                throw new ConflictException('Subdomain already exists');
            }
        }

        // Check email uniqueness if changed
        if (dto.email && dto.email !== school.email) {
            const existing = await this.schoolRepository.findOne({
                where: { email: dto.email },
            });
            if (existing) {
                throw new ConflictException('Email already exists');
            }
        }

        Object.assign(school, dto);
        return this.schoolRepository.save(school);
    }

    /**
     * Delete school (soft delete by setting isActive to false)
     */
    async remove(id: string): Promise<void> {
        const school = await this.findOne(id);
        school.isActive = false;
        await this.schoolRepository.save(school);
    }

    /**
     * Update subscription status
     */
    async updateSubscription(
        id: string,
        status: SubscriptionStatus,
        expiresAt?: Date,
    ): Promise<School> {
        const school = await this.findOne(id);
        school.subscriptionStatus = status;

        if (expiresAt) {
            school.subscriptionExpiresAt = expiresAt;
        }

        return this.schoolRepository.save(school);
    }

    /**
     * Check if school subscription is valid
     */
    async isSubscriptionValid(schoolId: string): Promise<boolean> {
        const school = await this.findOne(schoolId);

        if (!school.isActive) {
            return false;
        }

        if (school.subscriptionStatus === SubscriptionStatus.SUSPENDED) {
            return false;
        }

        if (
            school.subscriptionExpiresAt &&
            school.subscriptionExpiresAt < new Date()
        ) {
            // Auto-update to expired
            await this.updateSubscription(schoolId, SubscriptionStatus.EXPIRED);
            return false;
        }

        return true;
    }

    /**
     * Update school statistics
     */
    async updateStatistics(schoolId: string): Promise<void> {
        // TODO: Implement after adding schoolId to entities
        // This will query counts from related tables
        const school = await this.schoolRepository.findOne({
            where: { id: schoolId },
        });

        if (school) {
            // For now, keep counts at 0 until we add relations
            school.studentCount = 0;
            school.teacherCount = 0;
            school.classCount = 0;
            await this.schoolRepository.save(school);
        }
    }

    /**
     * Generate unique school code
     */
    private async generateSchoolCode(name: string): Promise<string> {
        // Create code from first 3 letters of name + random number
        const prefix = name
            .replace(/[^a-zA-Z]/g, '')
            .substring(0, 3)
            .toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const code = `${prefix}${randomNum}`;

        // Check if code already exists
        const existing = await this.schoolRepository.findOne({ where: { code } });
        if (existing) {
            // Recursively generate new code
            return this.generateSchoolCode(name);
        }

        return code;
    }
}
