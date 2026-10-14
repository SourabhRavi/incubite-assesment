import assert from "node:assert/strict";
import { after, test } from "node:test";
import dotenv from "dotenv";
import request from "supertest";

// Load a dedicated test database before importing the application.
const testEnv = dotenv.config({
  path: ".env.test",
  override: true,
});

if (!testEnv.parsed?.DATABASE_URL) {
  throw new Error(
    "Integration tests require server/.env.test with DATABASE_URL configured.",
  );
}

// Import after loading the test environment.
const { default: app } = await import("../src/app.js");
const { db } = await import("../src/prisma/db.js");

after(async () => {
  await db.close();
});

test("employee CRUD, listing and salary analytics work against PostgreSQL", async () => {
  const email = `integration.${Date.now()}@example.com`;
  const testSalary = 1_234_567;

  let employeeId: string | undefined;

  try {
    // 1. Capture initial employee counts from the real list endpoint.
    const indiaListBefore = await request(app)
      .get("/api/v1/employees")
      .query({ country: "India", limit: 1 });

    const canadaListBefore = await request(app)
      .get("/api/v1/employees")
      .query({ country: "Canada", limit: 1 });

    assert.equal(indiaListBefore.status, 200);
    assert.equal(canadaListBefore.status, 200);

    const indiaCountBefore = Number(indiaListBefore.body.pagination.total);
    const canadaCountBefore = Number(canadaListBefore.body.pagination.total);

    // 2. Capture baseline country-level salary analytics.
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

    // 3. Capture the Data Analyst group before the employee is added.
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

    // 4. CREATE: create an employee through the real API.
    const createResponse = await request(app).post("/api/v1/employees").send({
      fullName: "Integration Test Employee",
      email,
      jobTitle: "Software Engineer",
      country: "India",
      salary: 900_000,
    });

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.data.email, email);
    assert.equal(createResponse.body.data.country, "India");
    assert.equal(createResponse.body.data.currency, "INR");

    employeeId = createResponse.body.data.id;
    assert.ok(employeeId);

    // 5. LIST: creation should increase India's active employee count.
    const indiaListAfterCreate = await request(app)
      .get("/api/v1/employees")
      .query({ country: "India", limit: 1 });

    assert.equal(indiaListAfterCreate.status, 200);
    assert.equal(
      Number(indiaListAfterCreate.body.pagination.total),
      indiaCountBefore + 1,
    );
    assert.equal(indiaListAfterCreate.body.pagination.limit, 1);

    // 6. READ: retrieve the saved employee by ID.
    const getResponse = await request(app).get(
      `/api/v1/employees/${employeeId}`,
    );

    assert.equal(getResponse.status, 200);
    assert.equal(getResponse.body.data.email, email);
    assert.equal(getResponse.body.data.country, "India");
    assert.equal(Number(getResponse.body.data.salary), 900_000);

    // 7. UPDATE: change country, job title and salary.
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
    assert.equal(updateResponse.body.data.jobTitle, "Data Analyst");
    assert.equal(Number(updateResponse.body.data.salary), testSalary);

    // 8. LIST: changing country should update both list totals.
    const indiaListAfterUpdate = await request(app)
      .get("/api/v1/employees")
      .query({ country: "India", limit: 1 });

    const canadaListAfterUpdate = await request(app)
      .get("/api/v1/employees")
      .query({ country: "Canada", limit: 1 });

    assert.equal(indiaListAfterUpdate.status, 200);
    assert.equal(canadaListAfterUpdate.status, 200);

    assert.equal(
      Number(indiaListAfterUpdate.body.pagination.total),
      indiaCountBefore,
    );

    assert.equal(
      Number(canadaListAfterUpdate.body.pagination.total),
      canadaCountBefore + 1,
    );

    // 9. READ again: verify updated values are persisted.
    const getUpdatedResponse = await request(app).get(
      `/api/v1/employees/${employeeId}`,
    );

    assert.equal(getUpdatedResponse.status, 200);
    assert.equal(getUpdatedResponse.body.data.country, "Canada");
    assert.equal(getUpdatedResponse.body.data.currency, "CAD");
    assert.equal(Number(getUpdatedResponse.body.data.salary), testSalary);

    // 10. Verify country-level salary analytics.
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
      "Country average should include the updated employee",
    );

    // 11. Verify average salary by job title.
    const jobAveragesAfterResponse = await request(app)
      .get("/api/v1/analytics/job-title-average")
      .query({ country: "Canada" });

    assert.equal(jobAveragesAfterResponse.status, 200);

    const jobGroupsAfter = jobAveragesAfterResponse.body.data.data;

    const dataAnalystAfter = jobGroupsAfter.find(
      (group: { jobTitle: string }) => group.jobTitle === "Data Analyst",
    );

    assert.ok(dataAnalystAfter, "The Data Analyst group should exist");

    assert.equal(Number(dataAnalystAfter.employeeCount), jobCountBefore + 1);

    const expectedJobAverage =
      ((jobAverageBefore ?? 0) * jobCountBefore + testSalary) /
      (jobCountBefore + 1);

    assert.ok(
      Math.abs(Number(dataAnalystAfter.averageSalary) - expectedJobAverage) <
        0.01,
      "Job-title average should include the updated employee",
    );

    // 12. DELETE: soft-delete the employee through the real API.
    const deleteResponse = await request(app).delete(
      `/api/v1/employees/${employeeId}`,
    );

    assert.equal(deleteResponse.status, 200);
    employeeId = undefined;

    // 13. Verify the deleted employee can no longer be retrieved.
    const deletedEmployeeResponse = await request(app).get(
      `/api/v1/employees/${createResponse.body.data.id}`,
    );

    assert.equal(deletedEmployeeResponse.status, 404);

    // 14. Verify soft-deleted employees disappear from active lists.
    const indiaListAfterDelete = await request(app)
      .get("/api/v1/employees")
      .query({ country: "India", limit: 1 });

    const canadaListAfterDelete = await request(app)
      .get("/api/v1/employees")
      .query({ country: "Canada", limit: 1 });

    assert.equal(indiaListAfterDelete.status, 200);
    assert.equal(canadaListAfterDelete.status, 200);

    assert.equal(
      Number(indiaListAfterDelete.body.pagination.total),
      indiaCountBefore,
    );

    assert.equal(
      Number(canadaListAfterDelete.body.pagination.total),
      canadaCountBefore,
    );

    // 15. Verify deletion also removes the employee from analytics.
    const summaryAfterDeleteResponse = await request(app)
      .get("/api/v1/analytics/salary-summary")
      .query({ country: "Canada" });

    assert.equal(summaryAfterDeleteResponse.status, 200);

    assert.equal(
      Number(summaryAfterDeleteResponse.body.data.employeeCount),
      countBefore,
    );
  } finally {
    // Attempt cleanup if an assertion fails before normal deletion.
    if (employeeId) {
      await request(app)
        .delete(`/api/v1/employees/${employeeId}`)
        .catch(() => undefined);
    }
  }
});
