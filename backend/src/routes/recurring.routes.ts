import { Router, Request, Response, NextFunction } from 'express';
import {
  getRecurring,
  getRecurringById,
  createRecurring,
  updateRecurring,
  processPayment,
  deleteRecurring,
} from '../controllers/recurring.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createRecurringSchema, updateRecurringSchema } from '../schemas/fintech.schema.js';
import { ValidationError } from '../middleware/error.middleware.js';

const router = Router();
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function validateIdParam(req: Request, res: Response, next: NextFunction): void {
  if (!uuidRegex.test(req.params.id)) {
    return next(new ValidationError('Invalid recurring payment ID format. Must be a valid UUID.'));
  }
  next();
}

router.get('/', getRecurring);
router.get('/:id', validateIdParam, getRecurringById);
router.post('/', validateBody(createRecurringSchema), createRecurring);
router.patch('/:id', validateIdParam, validateBody(updateRecurringSchema), updateRecurring);
router.post('/:id/pay', validateIdParam, processPayment);
router.delete('/:id', validateIdParam, deleteRecurring);

export default router;
