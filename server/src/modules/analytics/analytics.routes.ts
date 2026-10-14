import { Router } from "express";
import {
  getJobTitleAverages,
  getSalarySummary,
} from "./analytics.controller.js";

const router = Router();

router.get("/salary-summary", getSalarySummary);
router.get("/job-title-average", getJobTitleAverages);

export default router;
