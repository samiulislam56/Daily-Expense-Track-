import { Router } from 'express';
import {
  getDailySummary,
  getMonthlySummary,
  getCategorySummary,
} from '../controllers/summary.controller.js';
import { validateQuery } from '../middleware/validate.middleware.js';
import {
  dailySummaryQuerySchema,
  monthlySummaryQuerySchema,
  categorySummaryQuerySchema,
} from '../schemas/summary.schema.js';

const router = Router();

router.get('/daily', validateQuery(dailySummaryQuerySchema), getDailySummary);
router.get('/monthly', validateQuery(monthlySummaryQuerySchema), getMonthlySummary);
router.get('/categories', validateQuery(categorySummaryQuerySchema), getCategorySummary);

export default router;
