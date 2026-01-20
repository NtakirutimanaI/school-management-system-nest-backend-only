import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceRequestsService } from './resource-requests.service';
import { ResourceRequestsController } from './resource-requests.controller';
import { ResourceRequest } from './entities/resource-request.entity';
import { TeachersModule } from '../teachers/teachers.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ResourceRequest]),
        TeachersModule,
    ],
    controllers: [ResourceRequestsController],
    providers: [ResourceRequestsService],
})
export class ResourceRequestsModule { }
