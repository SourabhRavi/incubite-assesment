#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/156d6ecfb9c118f0ceeffc445d3305613bdc6245945b17292bf5c75adec739b0/contract';
import startContract from '../../snapshots/156d6ecfb9c118f0ceeffc445d3305613bdc6245945b17292bf5c75adec739b0/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c7fa80713fa2c20453d568cae452188b6f1cc2c45b9c3a7d88fcb2ffa5442ef7/contract';
import endContract from '../../snapshots/c7fa80713fa2c20453d568cae452188b6f1cc2c45b9c3a7d88fcb2ffa5442ef7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.setDefault({
        schema: 'public',
        table: 'employees',
        column: col('country', 'text', {
          default: lit('India'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.setDefault({
        schema: 'public',
        table: 'employees',
        column: col('currency', 'text', {
          default: lit('INR'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'employees',
        constraint: 'employees_country_check_1fb36464',
        expression: `"country" IN ('India', 'United States', 'United Kingdom', 'Germany', 'Canada')`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'employees',
        constraint: 'employees_country_currency_match_33692e8b',
        expression:
          '(\n              ("country" = \'India\' AND "currency" = \'INR\')\n              OR ("country" = \'United States\' AND "currency" = \'USD\')\n              OR ("country" = \'United Kingdom\' AND "currency" = \'GBP\')\n              OR ("country" = \'Germany\' AND "currency" = \'EUR\')\n              OR ("country" = \'Canada\' AND "currency" = \'CAD\')\n            )',
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'employees',
        constraint: 'employees_currency_check_80a2ebdd',
        expression: `"currency" IN ('INR', 'USD', 'GBP', 'EUR', 'CAD')`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
