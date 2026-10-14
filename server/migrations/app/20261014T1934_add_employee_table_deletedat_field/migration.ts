#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/00149a080f11707111cd26bcd14a8c038df82b0e32b80b27e388064bbe0d5a43/contract';
import startContract from '../../snapshots/00149a080f11707111cd26bcd14a8c038df82b0e32b80b27e388064bbe0d5a43/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/810f342f4e6d9196e4e9f7ac8575456e486f6049647226954560d0f6af927426/contract';
import endContract from '../../snapshots/810f342f4e6d9196e4e9f7ac8575456e486f6049647226954560d0f6af927426/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'employees',
        column: col('deletedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-date@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
