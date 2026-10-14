import express from "express";
import cors from "cors";

import employeeRoutes from "./modules/employees/employee.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);

// routes
app.use("/api/v1/employees", employeeRoutes);

// error handler
app.use(errorHandler);

export default app;
