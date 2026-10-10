import { Router, Request, Response, NextFunction } from 'express';
import {
  createExpense,
  listExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from '../controllers/expense.controller.js';
import { validateBody, validateQuery } from '../middleware/validate.middleware.js';
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
} from '../schemas/expense.schema.js';
import { ValidationError } from '../middleware/error.middleware.js';

const router = Router();

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function validateIdParam(req: Request, res: Response, next: NextFunction): void {
  if (!uuidRegex.test(req.params.id)) {
    return next(new ValidationError('Invalid expense ID format. Must be a valid UUID.'));
  }
  next();
}

router.post('/', validateBody(createExpenseSchema), createExpense);
router.get('/', validateQuery(expenseQuerySchema), listExpenses);
router.get('/:id', validateIdParam, getExpenseById);
router.patch('/:id', validateIdParam, validateBody(updateExpenseSchema), updateExpense);
router.delete('/:id', validateIdParam, deleteExpense);

export default router;
