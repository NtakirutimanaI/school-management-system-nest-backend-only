import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    TypeOrmHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator,
    ) { }

    @Get()
    @HealthCheck()
    @ApiOperation({ summary: 'Check application health' })
    check() {
        return this.health.check([
            // Database health
            () => this.db.pingCheck('database'),

            // Memory health (heap should not exceed 300MB)
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

            // Memory health (RSS should not exceed 500MB)
            () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),

            // Disk health (should have at least 50% free space)
            () =>
                this.disk.checkStorage('disk', {
                    path: '/',
                    thresholdPercent: 0.5,
                }),
        ]);
    }

    @Get('database')
    @HealthCheck()
    @ApiOperation({ summary: 'Check database health' })
    checkDatabase() {
        return this.health.check([() => this.db.pingCheck('database')]);
    }

    @Get('memory')
    @HealthCheck()
    @ApiOperation({ summary: 'Check memory health' })
    checkMemory() {
        return this.health.check([
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
        ]);
    }

    @Get('disk')
    @HealthCheck()
    @ApiOperation({ summary: 'Check disk health' })
    checkDisk() {
        return this.health.check([
            () =>
                this.disk.checkStorage('disk', {
                    path: '/',
                    thresholdPercent: 0.5,
                }),
        ]);
    }
}
