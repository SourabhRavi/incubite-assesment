export const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Germany",
  "Canada",
] as const;

export const CURRENCIES = ["INR", "USD", "GBP", "EUR", "CAD"] as const;

export const JOB_TITLES = [
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

export type Country = (typeof COUNTRIES)[number];
export type Currency = (typeof CURRENCIES)[number];
export type JobTitle = (typeof JOB_TITLES)[number];

export const COUNTRY_CURRENCY_MAP = {
  India: "INR",
  "United States": "USD",
  "United Kingdom": "GBP",
  Germany: "EUR",
  Canada: "CAD",
} as const satisfies Record<Country, Currency>;

export const EMPLOYEE_LIMITS = {
  FULL_NAME_MIN_LENGTH: 2,
  FULL_NAME_MAX_LENGTH: 150,
  EMAIL_MAX_LENGTH: 254,
  JOB_TITLE_MIN_LENGTH: 2,
  JOB_TITLE_MAX_LENGTH: 100,
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
