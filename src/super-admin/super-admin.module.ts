import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminController } from './super-admin.controller';
import { SystemSetting } from './entities/system-setting.entity';
import { User } from '../users/entities/user.entity';
import { AuditLog } from '../common/entities/audit-log.entity';
import { SchoolsModule } from '../schools/schools.module';
import { UsersModule } from '../users/users.module';
import { AuditLogService } from '../common/services/audit-log.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([SystemSetting, User, AuditLog]),
        SchoolsModule,
        UsersModule,
    ],
    controllers: [SuperAdminController],
    providers: [SuperAdminService, AuditLogService],
})
export class SuperAdminModule { }
