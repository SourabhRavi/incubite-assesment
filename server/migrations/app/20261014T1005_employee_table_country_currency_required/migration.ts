#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/00149a080f11707111cd26bcd14a8c038df82b0e32b80b27e388064bbe0d5a43/contract';
import endContract from '../../snapshots/00149a080f11707111cd26bcd14a8c038df82b0e32b80b27e388064bbe0d5a43/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c7fa80713fa2c20453d568cae452188b6f1cc2c45b9c3a7d88fcb2ffa5442ef7/contract';
import startContract from '../../snapshots/c7fa80713fa2c20453d568cae452188b6f1cc2c45b9c3a7d88fcb2ffa5442ef7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropDefault({ schema: 'public', table: 'employees', column: 'country' }),
      this.dropDefault({ schema: 'public', table: 'employees', column: 'currency' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
