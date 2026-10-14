import { Router } from "express";
import {
  create,
  getById,
  list,
  remove,
  update,
} from "./employee.controller.js";

const router = Router();

// GET /api/v1/employees
// POST /api/v1/employees
router.route("/").get(list).post(create);

// GET /api/v1/employees/:id
// PATCH /api/v1/employees/:id
// DELETE /api/v1/employees/:id
router.route("/:id").get(getById).patch(update).delete(remove);

export default router;
