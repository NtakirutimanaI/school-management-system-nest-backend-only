import { Repository, FindOptionsWhere, FindManyOptions, FindOneOptions } from 'typeorm';
import { Injectable, Scope } from '@nestjs/common';

/**
 * Base repository that automatically filters queries by schoolId
 * Ensures data isolation in multi-tenant environment
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantAwareRepository<T extends { schoolId?: string }> {
    constructor(
        private readonly repository: Repository<T>,
        private readonly schoolId?: string,
    ) { }

    /**
     * Find entities filtered by current school
     */
    async find(options?: FindManyOptions<T>): Promise<T[]> {
        return this.repository.find({
            ...options,
            where: this.addSchoolFilter(options?.where),
        } as FindManyOptions<T>);
    }

    /**
     * Find one entity filtered by current school
     */
    async findOne(options: FindOneOptions<T>): Promise<T | null> {
        return this.repository.findOne({
            ...options,
            where: this.addSchoolFilter(options.where),
        } as FindOneOptions<T>);
    }

    /**
     * Find entities with count filtered by current school
     */
    async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
        return this.repository.findAndCount({
            ...options,
            where: this.addSchoolFilter(options?.where),
        } as FindManyOptions<T>);
    }

    /**
   * Save entity with schoolId
   */
    async save(entity: T | T[]): Promise<T | T[]> {
        if (Array.isArray(entity)) {
            const entities = entity.map((e) => ({ ...e, schoolId: this.schoolId })) as T[];
            return this.repository.save(entities) as Promise<T[]>;
        }
        return this.repository.save({ ...entity, schoolId: this.schoolId } as T);
    }

    /**
     * Create entity with schoolId
     */
    create(entityLike: Partial<T>): T {
        return this.repository.create({
            ...entityLike,
            schoolId: this.schoolId,
        } as any) as unknown as T;
    }

    /**
     * Update entity ensuring it belongs to current school
     */
    async update(
        criteria: FindOptionsWhere<T>,
        partialEntity: Partial<T>,
    ): Promise<any> {
        return this.repository.update(
            this.addSchoolFilter(criteria) as any,
            partialEntity as any,
        );
    }
    /**
     * Delete entity ensuring it belongs to current school
     */
    async delete(criteria: FindOptionsWhere<T>): Promise<any> {
        return this.repository.delete(this.addSchoolFilter(criteria) as any);
    }

    /**
     * Count entities filtered by current school
     */
    async count(options?: FindManyOptions<T>): Promise<number> {
        return this.repository.count({
            ...options,
            where: this.addSchoolFilter(options?.where),
        } as FindManyOptions<T>);
    }

    /**
     * Create query builder with automatic school filtering
     */
    createQueryBuilder(alias: string) {
        const qb = this.repository.createQueryBuilder(alias);
        if (this.schoolId) {
            qb.andWhere(`${alias}.schoolId = :schoolId`, {
                schoolId: this.schoolId,
            });
        }
        return qb;
    }

    /**
     * Add school filter to where clause
     */
    private addSchoolFilter(
        where?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
        if (!this.schoolId) {
            return where || {};
        }

        if (Array.isArray(where)) {
            return where.map((w) => ({ ...w, schoolId: this.schoolId }));
        }

        return { ...where, schoolId: this.schoolId } as FindOptionsWhere<T>;
    }

    /**
     * Get the underlying repository (use with caution - bypasses tenant filtering)
     */
    getRepository(): Repository<T> {
        return this.repository;
    }
}
