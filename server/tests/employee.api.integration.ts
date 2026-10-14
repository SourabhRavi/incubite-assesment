import assert from "node:assert/strict";
import { after, test } from "node:test";
import dotenv from "dotenv";
import request from "supertest";

// Require a dedicated test database before importing the application.
const testEnv = dotenv.config({
  path: ".env.test",
  override: true,
});

if (!testEnv.parsed?.DATABASE_URL) {
  throw new Error(
    "Integration tests require server/.env.test with DATABASE_URL configured.",
  );
}

// Import only after loading the test database configuration.
const { default: app } = await import("../src/app.js");
const { db } = await import("../src/prisma/db.js");

after(async () => {
  await db.close();
});

test("employee CRUD and salary analytics work against PostgreSQL", async () => {
  const email = `integration.${Date.now()}@example.com`;
  const testSalary = 1_234_567;

  let employeeId: string | undefined;

  try {
    // 1. Record the baseline analytics before changing any data.
    const summaryBeforeResponse = await request(app)
      .get("/api/v1/analytics/salary-summary")
      .query({ country: "Canada" });

    assert.equal(summaryBeforeResponse.status, 200);

    const summaryBefore = summaryBeforeResponse.body.data;
    const countBefore = Number(summaryBefore.employeeCount);
    const minBefore =
      summaryBefore.minSalary == null ? null : Number(summaryBefore.minSalary);
    const maxBefore =
      summaryBefore.maxSalary == null ? null : Number(summaryBefore.maxSalary);
    const averageBefore =
      summaryBefore.averageSalary == null
        ? null
        : Number(summaryBefore.averageSalary);

    const jobAveragesBeforeResponse = await request(app)
      .get("/api/v1/analytics/job-title-average")
      .query({ country: "Canada" });

    assert.equal(jobAveragesBeforeResponse.status, 200);

    const jobGroupsBefore = jobAveragesBeforeResponse.body.data.data;
    const dataAnalystBefore = jobGroupsBefore.find(
      (group: { jobTitle: string }) => group.jobTitle === "Data Analyst",
    );

    const jobCountBefore = Number(dataAnalystBefore?.employeeCount ?? 0);
    const jobAverageBefore = dataAnalystBefore
      ? Number(dataAnalystBefore.averageSalary)
      : null;

    // 2. Create an employee through the real HTTP endpoint.
    const createResponse = await request(app).post("/api/v1/employees").send({
      fullName: "Integration Test Employee",
      email,
      jobTitle: "Software Engineer",
      country: "India",
      salary: 900_000,
    });

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.data.email, email);
    assert.equal(createResponse.body.data.currency, "INR");

    employeeId = createResponse.body.data.id;
    assert.ok(employeeId);

    // 3. Retrieve the persisted record.
    const getResponse = await request(app).get(
      `/api/v1/employees/${employeeId}`,
    );

    assert.equal(getResponse.status, 200);
    assert.equal(getResponse.body.data.email, email);
    assert.equal(getResponse.body.data.country, "India");

    // 4. Update salary, job title, country and derived currency.
    const updateResponse = await request(app)
      .patch(`/api/v1/employees/${employeeId}`)
      .send({
        country: "Canada",
        jobTitle: "Data Analyst",
        salary: testSalary,
      });

    assert.equal(updateResponse.status, 200);
    assert.equal(updateResponse.body.data.country, "Canada");
    assert.equal(updateResponse.body.data.currency, "CAD");
    assert.equal(Number(updateResponse.body.data.salary), testSalary);

    // 5. Verify country-level salary analytics.
    const summaryAfterResponse = await request(app)
      .get("/api/v1/analytics/salary-summary")
      .query({ country: "Canada" });

    assert.equal(summaryAfterResponse.status, 200);

    const summaryAfter = summaryAfterResponse.body.data;

    assert.equal(Number(summaryAfter.employeeCount), countBefore + 1);

    const expectedMin =
      minBefore === null ? testSalary : Math.min(minBefore, testSalary);
    const expectedMax =
      maxBefore === null ? testSalary : Math.max(maxBefore, testSalary);

    assert.equal(Number(summaryAfter.minSalary), expectedMin);
    assert.equal(Number(summaryAfter.maxSalary), expectedMax);

    const expectedAverage =
      ((averageBefore ?? 0) * countBefore + testSalary) / (countBefore + 1);

    assert.ok(
      Math.abs(Number(summaryAfter.averageSalary) - expectedAverage) < 0.01,
      "Country average salary should reflect the updated employee",
    );

    // 6. Verify average salary grouped by job title.
    const jobAveragesAfterResponse = await request(app)
      .get("/api/v1/analytics/job-title-average")
      .query({ country: "Canada" });

    assert.equal(jobAveragesAfterResponse.status, 200);

    const jobGroupsAfter = jobAveragesAfterResponse.body.data.data;
    const dataAnalystAfter = jobGroupsAfter.find(
      (group: { jobTitle: string }) => group.jobTitle === "Data Analyst",
    );

    assert.ok(dataAnalystAfter, "Data Analyst group should exist");
    assert.equal(Number(dataAnalystAfter.employeeCount), jobCountBefore + 1);

    const expectedJobAverage =
      ((jobAverageBefore ?? 0) * jobCountBefore + testSalary) /
      (jobCountBefore + 1);

    assert.ok(
      Math.abs(Number(dataAnalystAfter.averageSalary) - expectedJobAverage) <
        0.01,
      "Job-title average salary should be recalculated correctly",
    );

    // 7. Soft-delete the employee.
    const deleteResponse = await request(app).delete(
      `/api/v1/employees/${employeeId}`,
    );

    assert.equal(deleteResponse.status, 200);
    employeeId = undefined;

    // Deleted employees must no longer be retrievable.
    const deletedEmployeeResponse = await request(app).get(
      `/api/v1/employees/${createResponse.body.data.id}`,
    );

    assert.equal(deletedEmployeeResponse.status, 404);

    // Deletion must also remove the employee from active analytics.
    const summaryAfterDeleteResponse = await request(app)
      .get("/api/v1/analytics/salary-summary")
      .query({ country: "Canada" });

    assert.equal(summaryAfterDeleteResponse.status, 200);
    assert.equal(
      Number(summaryAfterDeleteResponse.body.data.employeeCount),
      countBefore,
    );
  } finally {
    // If an assertion fails mid-test, try to clean up our test employee.
    if (employeeId) {
      await request(app)
        .delete(`/api/v1/employees/${employeeId}`)
        .catch(() => undefined);
    }
  }
});
