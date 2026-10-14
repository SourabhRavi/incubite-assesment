#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/156d6ecfb9c118f0ceeffc445d3305613bdc6245945b17292bf5c75adec739b0/contract';
import endContract from '../../snapshots/156d6ecfb9c118f0ceeffc445d3305613bdc6245945b17292bf5c75adec739b0/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'employees',
        columns: [
          col('country', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('currency', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('fullName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('jobTitle', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('salary', 'numeric', { notNull: true, codecRef: { codecId: 'pg/numeric@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('employees_salary_nonnegative_238dd4cc', 'salary >= 0'),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'employees',
        constraint: 'employees_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employees',
        index: 'employees_country_idx_c3994778',
        columns: ['country'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employees',
        index: 'employees_country_job_title_idx_ab97ab9f',
        columns: ['country', 'jobTitle'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
