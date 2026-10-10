import { Router, Request, Response, NextFunction } from 'express';
import { getBudgets, setBudget, deleteBudget } from '../controllers/budget.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { setBudgetSchema } from '../schemas/fintech.schema.js';
import { ValidationError } from '../middleware/error.middleware.js';

const router = Router();
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function validateIdParam(req: Request, res: Response, next: NextFunction): void {
  if (!uuidRegex.test(req.params.id)) {
    return next(new ValidationError('Invalid budget ID format. Must be a valid UUID.'));
  }
  next();
}

router.get('/', getBudgets);
router.post('/', validateBody(setBudgetSchema), setBudget);
router.delete('/:id', validateIdParam, deleteBudget);

export default router;
