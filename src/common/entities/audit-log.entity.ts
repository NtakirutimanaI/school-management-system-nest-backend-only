import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

export enum AuditAction {
    // User actions
    USER_CREATED = 'user_created',
    USER_UPDATED = 'user_updated',
    USER_DELETED = 'user_deleted',
    USER_LOGIN = 'user_login',
    USER_LOGIN_FAILED = 'user_login_failed',
    USER_LOGOUT = 'user_logout',
    PASSWORD_CHANGED = 'password_changed',
    PASSWORD_RESET_REQUESTED = 'password_reset_requested',
    PASSWORD_RESET_COMPLETED = 'password_reset_completed',

    // Role changes
    ROLE_CHANGED = 'role_changed',
    PERMISSIONS_CHANGED = 'permissions_changed',

    // Student actions
    STUDENT_CREATED = 'student_created',
    STUDENT_UPDATED = 'student_updated',
    STUDENT_DELETED = 'student_deleted',
    STUDENT_ENROLLED = 'student_enrolled',
    STUDENT_UNENROLLED = 'student_unenrolled',

    // Teacher actions
    TEACHER_CREATED = 'teacher_created',
    TEACHER_UPDATED = 'teacher_updated',
    TEACHER_DELETED = 'teacher_deleted',

    // Financial actions
    PAYMENT_CREATED = 'payment_created',
    PAYMENT_UPDATED = 'payment_updated',
    PAYMENT_DELETED = 'payment_deleted',
    FEE_CREATED = 'fee_created',
    FEE_UPDATED = 'fee_updated',

    // Academic actions
    EXAM_CREATED = 'exam_created',
    EXAM_UPDATED = 'exam_updated',
    EXAM_DELETED = 'exam_deleted',
    RESULT_PUBLISHED = 'result_published',
    RESULT_UPDATED = 'result_updated',

    // System actions
    SETTINGS_CHANGED = 'settings_changed',
    BACKUP_CREATED = 'backup_created',
    BACKUP_RESTORED = 'backup_restored',

    // School actions (multi-tenant)
    SCHOOL_CREATED = 'school_created',
    SCHOOL_UPDATED = 'school_updated',
    SCHOOL_DELETED = 'school_deleted',
    SCHOOL_SUSPENDED = 'school_suspended',
    SCHOOL_ACTIVATED = 'school_activated',
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['schoolId', 'createdAt'])
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: AuditAction })
    @Index()
    action: AuditAction;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    userId: string;

    @Column({ nullable: true })
    userEmail: string;

    @Column({ nullable: true })
    userRole: string;

    @Column({ type: 'uuid', nullable: true })
    @Index()
    schoolId: string;

    @Column({ type: 'varchar', nullable: true })
    entityType: string; // e.g., 'User', 'Student', 'Payment'

    @Column({ type: 'uuid', nullable: true })
    entityId: string;

    @Column({ type: 'json', nullable: true })
    oldValues: Record<string, any>;

    @Column({ type: 'json', nullable: true })
    newValues: Record<string, any>;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ type: 'text', nullable: true })
    userAgent: string;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    @Index()
    createdAt: Date;
}
