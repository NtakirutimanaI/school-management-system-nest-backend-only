import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('system_settings')
export class SystemSetting {
    @ApiProperty({ example: 'site_branding' })
    @PrimaryColumn()
    key: string;

    @ApiProperty({ example: { name: 'My School', logoUrl: '...' } })
    @Column({ type: 'json', nullable: true }) // using 'json' for compatibility across DBs, 'jsonb' is Postgres specific
    value: any;

    @ApiProperty({ example: 'General settings for the application' })
    @Column({ nullable: true })
    description: string;

    @ApiProperty()
    @Column({ name: 'is_public', default: false })
    isPublic: boolean;

    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
