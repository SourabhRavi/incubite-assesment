import "dotenv/config";
import { faker } from "@faker-js/faker";
import { db } from "./db.js";

const TOTAL_EMPLOYEES = 10_000;
const BATCH_SIZE = 500;

const countrySalaryConfig = [
  {
    country: "India",
    currency: "INR",
    minSalary: 600_000,
    maxSalary: 3_000_000,
  },
  {
    country: "United States",
    currency: "USD",
    minSalary: 60_000,
    maxSalary: 200_000,
  },
  {
    country: "United Kingdom",
    currency: "GBP",
    minSalary: 35_000,
    maxSalary: 120_000,
  },
  {
    country: "Germany",
    currency: "EUR",
    minSalary: 40_000,
    maxSalary: 130_000,
  },
  {
    country: "Canada",
    currency: "CAD",
    minSalary: 55_000,
    maxSalary: 170_000,
  },
] as const;

const jobTitles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Software Engineer",
  "QA Engineer",
  "DevOps Engineer",
  "Data Analyst",
  "Product Manager",
  "Engineering Manager",
  "UI/UX Designer",
] as const;

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

    const employees = Array.from({ length: batchSize }, (_, offset) => {
      const config = faker.helpers.arrayElement(countrySalaryConfig);

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      return {
        fullName: `${firstName} ${lastName}`,
        email: generateEmail(firstName, lastName),
        jobTitle: faker.helpers.arrayElement(jobTitles),
        country: config.country,
        currency: config.currency,
        salary: String(
          faker.number.int({
            min: config.minSalary,
            max: config.maxSalary,
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
