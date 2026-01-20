import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Class } from '../../classes/entities/class.entity';

export enum SubscriptionStatus {
    TRIAL = 'trial',
    ACTIVE = 'active',
    EXPIRED = 'expired',
    SUSPENDED = 'suspended',
}

export enum SubscriptionPlan {
    FREE = 'free',
    BASIC = 'basic',
    PREMIUM = 'premium',
    ENTERPRISE = 'enterprise',
}

export interface SchoolSettings {
    academicYearStart?: string; // e.g., "September"
    academicYearEnd?: string; // e.g., "June"
    timezone?: string; // e.g., "Africa/Kigali"
    currency?: string; // e.g., "RWF"
    language?: string; // e.g., "en"
    dateFormat?: string; // e.g., "DD/MM/YYYY"
    allowParentRegistration?: boolean;
    requireEmailVerification?: boolean;
    enableSMSNotifications?: boolean;
    enableEmailNotifications?: boolean;
    maxStudents?: number;
    maxTeachers?: number;
    maxClasses?: number;
    customDomain?: string;
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        logo?: string;
    };
}

@Entity('schools')
@Index(['code'], { unique: true })
@Index(['email'], { unique: true })
@Index(['subdomain'], { unique: true })
export class School {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 20 })
    code: string; // e.g., "SCH001", "GREENWOOD"

    @Column({ length: 200 })
    name: string;

    @Column({ unique: true, length: 100, nullable: true })
    subdomain: string; // e.g., "greenwood" for greenwood.schoolplatform.com

    @Column({ nullable: true })
    logo: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ nullable: true, length: 20 })
    phone: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ type: 'text', nullable: true })
    website: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.TRIAL,
    })
    @Index()
    subscriptionStatus: SubscriptionStatus;

    @Column({
        type: 'enum',
        enum: SubscriptionPlan,
        default: SubscriptionPlan.FREE,
    })
    subscriptionPlan: SubscriptionPlan;

    @Column({ type: 'timestamp', nullable: true })
    subscriptionStartedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    subscriptionExpiresAt: Date;

    @Column({ type: 'json', nullable: true })
    settings: SchoolSettings;

    @Column({ default: true })
    @Index()
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    studentCount: number;

    @Column({ type: 'int', default: 0 })
    teacherCount: number;

    @Column({ type: 'int', default: 0 })
    classCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relations - TODO: Uncomment after adding schoolId to entities
    // @OneToMany(() => User, (user) => user.school)
    // users: User[];

    // @OneToMany(() => Student, (student) => student.school)
    // students: Student[];

    // @OneToMany(() => Teacher, (teacher) => teacher.school)
    // teachers: Teacher[];

    // @OneToMany(() => Class, (classEntity) => classEntity.school)
    // classes: Class[];
}
