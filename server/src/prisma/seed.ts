import "dotenv/config";
import { faker } from "@faker-js/faker";
import {
  COUNTRY_CURRENCY_MAP,
  COUNTRIES,
  JOB_TITLES,
  type Country,
} from "../constants/constants.js";
import { db } from "./db.js";

const TOTAL_EMPLOYEES = 10_000;
const BATCH_SIZE = 500;

const countrySalaryConfig = {
  India: { minSalary: 600_000, maxSalary: 3_000_000 },
  "United States": { minSalary: 60_000, maxSalary: 200_000 },
  "United Kingdom": { minSalary: 35_000, maxSalary: 120_000 },
  Germany: { minSalary: 40_000, maxSalary: 130_000 },
  Canada: { minSalary: 55_000, maxSalary: 170_000 },
} as const satisfies Record<Country, { minSalary: number; maxSalary: number }>;

const usedEmails = new Set<string>();

function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function generateEmail(firstName: string, lastName: string): string {
  const base = `${normalizeName(firstName)}.${normalizeName(lastName)}`;

  let email = `${base}@citadel.dev`;
  let suffix = 2;

  while (usedEmails.has(email)) {
    email = `${base}${suffix}@citadel.dev`;
    suffix++;
  }

  usedEmails.add(email);
  return email;
}

async function main(): Promise<void> {
  const existingEmployees = await db.orm.public.Employee.all();

  if (existingEmployees.length > 0) {
    throw new Error(
      `Seed aborted: ${existingEmployees.length} employees already exist. ` +
        "No existing records were modified.",
    );
  }

  let totalCreated = 0;

  for (let start = 0; start < TOTAL_EMPLOYEES; start += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, TOTAL_EMPLOYEES - start);

    const employees = Array.from({ length: batchSize }, () => {
      const country = faker.helpers.arrayElement(COUNTRIES);
      const salaryConfig = countrySalaryConfig[country];

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      return {
        fullName: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName),
        jobTitle: faker.helpers.arrayElement(JOB_TITLES),
        country,
        currency: COUNTRY_CURRENCY_MAP[country],
        salary: String(
          faker.number.int({
            min: salaryConfig.minSalary,
            max: salaryConfig.maxSalary,
          }),
        ),
      };
    });

    const created = await db.orm.public.Employee.createAll(employees);

    totalCreated += created.length;

    console.log(`Seeded ${totalCreated}/${TOTAL_EMPLOYEES} employees`);
  }

  console.log(`Successfully seeded ${totalCreated} employees.`);
}

main()
  .catch((error: unknown) => {
    console.error("Employee seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
