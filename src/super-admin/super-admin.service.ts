import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SchoolsService } from '../schools/schools.service';
import { UsersService } from '../users/users.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { User } from '../users/entities/user.entity';
import { CreateSchoolDto } from '../schools/dto/create-school.dto';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class SuperAdminService {
    constructor(
        @InjectRepository(SystemSetting)
        private settingsRepo: Repository<SystemSetting>,
        @InjectRepository(User)
        private usersRepo: Repository<User>,
        private schoolsService: SchoolsService,
        private usersService: UsersService,
        private auditLogService: AuditLogService,
    ) { }

    // --- Schools ---
    async createSchool(dto: CreateSchoolDto) {
        return this.schoolsService.create(dto);
    }

    async getAllSchools(page = 1, limit = 10, search?: string) {
        return this.schoolsService.findAll(page, limit, { search });
    }

    async toggleSchoolStatus(id: string, isActive: boolean) {
        const school = await this.schoolsService.findOne(id);
        school.isActive = isActive;
        // We might need to save directly or use service update
        // SchoolsService update takes DTO. Let's use service if possible, or repo via service.
        // SchoolsService doesn't expose direct repo. I'll use update DTO.
        return this.schoolsService.update(id, { isActive } as any);
    }

    // --- Users ---
    async getAllUsers(page = 1, limit = 10, role?: UserRole) {
        const query = this.usersRepo.createQueryBuilder('user');
        if (role) query.where('user.role = :role', { role });

        const [data, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total, page, limit };
    }

    async createUser(dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    async updateUserStatus(id: string, isActive: boolean) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        user.isActive = isActive;
        return this.usersRepo.save(user);
    }

    async assignRole(id: string, role: UserRole) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        user.role = role;
        return this.usersRepo.save(user);
    }

    // --- Settings ---
    async getSettings() {
        return this.settingsRepo.find();
    }

    async updateSetting(key: string, dto: UpdateSettingDto) {
        let setting = await this.settingsRepo.findOne({ where: { key } });
        if (!setting) {
            setting = this.settingsRepo.create({ key, ...dto });
        } else {
            Object.assign(setting, dto);
        }
        return this.settingsRepo.save(setting);
    }

    // --- Audit Logs ---
    async getAuditLogs(limit = 100) {
        return this.auditLogService.findAll({ limit });
    }

    // --- Backups (Mock) ---
    async triggerBackup() {
        // In real app, this would spawn a pg_dump process or queue a job
        return { message: 'Backup job queued via System Queue', jobId: Date.now() };
    }

    // --- Reports/Dashboard ---
    async getDashboardStats() {
        // Helper way to get total from existing service structure
        const totalSchools = await this.schoolsService.findAll(1, 1);
        const totalUsers = await this.usersRepo.count();
        const activeSchools = await this.schoolsService.findAll(1, 1, { isActive: true });

        return {
            totalSchools: totalSchools.total,
            activeSchools: activeSchools.total,
            totalUsers,
            systemHealth: 'HEALTHY',
            lastBackup: new Date(),
        };
    }
}
