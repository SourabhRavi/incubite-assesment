import assert from "node:assert/strict";
import { after, test } from "node:test";
import dotenv from "dotenv";
import request from "supertest";

const testEnv = dotenv.config({
  path: ".env.test",
  override: true,
});

if (!testEnv.parsed?.DATABASE_URL) {
  throw new Error(
    "Integration tests require server/.env.test with DATABASE_URL configured.",
  );
}

const { default: app } = await import("../src/app.js");
const { db } = await import("../src/prisma/db.js");

after(async () => {
  await db.close();
});

test("employee CRUD, search, listing and salary analytics work against PostgreSQL", async () => {
  const uniqueToken = String(Date.now());
  const email = `integration.${uniqueToken}@example.com`;
  const fullName = `Integration Test Employee ${uniqueToken}`;
  const testSalary = 1_234_567;

  let employeeId: string | undefined;

  try {
    // Capture baseline list counts.
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

    // Capture baseline country salary analytics.
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

    // Capture baseline Data Analyst analytics.
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

    // CREATE: add an employee through the real API.
    const createResponse = await request(app).post("/api/v1/employees").send({
      fullName,
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

    // SEARCH: find the employee by name.
    const nameSearchResponse = await request(app)
      .get("/api/v1/employees")
      .query({ search: fullName });

    assert.equal(
      nameSearchResponse.status,
      200,
      JSON.stringify(nameSearchResponse.body),
    );

    assert.ok(
      nameSearchResponse.body.data.some(
        (employee: { email: string }) => employee.email === email,
      ),
      "Name search should find the created employee",
    );

    // SEARCH: find the employee by email, ignoring capitalization.
    const emailSearchResponse = await request(app)
      .get("/api/v1/employees")
      .query({ search: email.toUpperCase() });

    assert.equal(emailSearchResponse.status, 200);
    assert.equal(emailSearchResponse.body.pagination.total, 1);
    assert.equal(emailSearchResponse.body.data.length, 1);
    assert.equal(emailSearchResponse.body.data[0].email, email);

    // SEARCH + FILTERS: combine keyword, country and job title.
    const combinedSearchResponse = await request(app)
      .get("/api/v1/employees")
      .query({
        search: email,
        country: "India",
        jobTitle: "Software Engineer",
      });

    assert.equal(combinedSearchResponse.status, 200);
    assert.equal(combinedSearchResponse.body.pagination.total, 1);
    assert.equal(combinedSearchResponse.body.data[0].email, email);

    // A conflicting country must return no results.
    const noMatchResponse = await request(app).get("/api/v1/employees").query({
      search: email,
      country: "Canada",
    });

    assert.equal(noMatchResponse.status, 200);
    assert.equal(noMatchResponse.body.pagination.total, 0);
    assert.deepEqual(noMatchResponse.body.data, []);

    // Pagination totals must reflect search results.
    const paginatedSearchResponse = await request(app)
      .get("/api/v1/employees")
      .query({
        search: email,
        page: 1,
        limit: 1,
      });

    assert.equal(paginatedSearchResponse.status, 200);
    assert.equal(paginatedSearchResponse.body.pagination.total, 1);
    assert.equal(paginatedSearchResponse.body.pagination.totalPages, 1);
    assert.equal(paginatedSearchResponse.body.data.length, 1);

    // SEARCH VALIDATION: reject a term exceeding 100 characters.
    const longSearchResponse = await request(app)
      .get("/api/v1/employees")
      .query({ search: "a".repeat(101) });

    assert.equal(longSearchResponse.status, 400);
    assert.equal(longSearchResponse.body.error, "Invalid query parameters");

    // LIST: creation should increase India's active employee count.
    const indiaListAfterCreate = await request(app)
      .get("/api/v1/employees")
      .query({ country: "India", limit: 1 });

    assert.equal(indiaListAfterCreate.status, 200);
    assert.equal(
      Number(indiaListAfterCreate.body.pagination.total),
      indiaCountBefore + 1,
    );

    // READ: retrieve the employee by ID.
    const getResponse = await request(app).get(
      `/api/v1/employees/${employeeId}`,
    );

    assert.equal(getResponse.status, 200);
    assert.equal(getResponse.body.data.email, email);
    assert.equal(getResponse.body.data.country, "India");
    assert.equal(Number(getResponse.body.data.salary), 900_000);

    // UPDATE: change country, job title and salary.
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

    // Search must respect the employee's updated fields.
    const updatedFilterSearchResponse = await request(app)
      .get("/api/v1/employees")
      .query({
        search: email,
        country: "Canada",
        jobTitle: "Data Analyst",
      });

    assert.equal(updatedFilterSearchResponse.status, 200);
    assert.equal(updatedFilterSearchResponse.body.pagination.total, 1);
    assert.equal(updatedFilterSearchResponse.body.data[0].email, email);

    // The employee should no longer match the old filters.
    const oldFilterSearchResponse = await request(app)
      .get("/api/v1/employees")
      .query({
        search: email,
        country: "India",
        jobTitle: "Software Engineer",
      });

    assert.equal(oldFilterSearchResponse.status, 200);
    assert.equal(oldFilterSearchResponse.body.pagination.total, 0);

    // LIST: country counts should reflect the update.
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

    // READ: verify the updated data was persisted.
    const getUpdatedResponse = await request(app).get(
      `/api/v1/employees/${employeeId}`,
    );

    assert.equal(getUpdatedResponse.status, 200);
    assert.equal(getUpdatedResponse.body.data.country, "Canada");
    assert.equal(getUpdatedResponse.body.data.currency, "CAD");
    assert.equal(Number(getUpdatedResponse.body.data.salary), testSalary);

    // ANALYTICS: country summary should include the updated employee.
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

    // ANALYTICS: verify the job-title average.
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

    // DELETE: soft-delete the employee.
    const deleteResponse = await request(app).delete(
      `/api/v1/employees/${employeeId}`,
    );

    assert.equal(deleteResponse.status, 200);
    employeeId = undefined;

    // Deleted employees should no longer be retrievable.
    const deletedEmployeeResponse = await request(app).get(
      `/api/v1/employees/${createResponse.body.data.id}`,
    );

    assert.equal(deletedEmployeeResponse.status, 404);

    // Deleted employees should not appear in search.
    const deletedSearchResponse = await request(app)
      .get("/api/v1/employees")
      .query({ search: email });

    assert.equal(deletedSearchResponse.status, 200);
    assert.equal(deletedSearchResponse.body.pagination.total, 0);
    assert.deepEqual(deletedSearchResponse.body.data, []);

    // Active list counts should return to their baselines.
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

    // Analytics should return to the initial count.
    const summaryAfterDeleteResponse = await request(app)
      .get("/api/v1/analytics/salary-summary")
      .query({ country: "Canada" });

    assert.equal(summaryAfterDeleteResponse.status, 200);
    assert.equal(
      Number(summaryAfterDeleteResponse.body.data.employeeCount),
      countBefore,
    );
  } finally {
    // Clean up if an assertion fails before normal deletion.
    if (employeeId) {
      await request(app)
        .delete(`/api/v1/employees/${employeeId}`)
        .catch(() => undefined);
    }
  }
});
