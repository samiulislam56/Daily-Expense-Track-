import { Router, Request, Response, NextFunction } from 'express';
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  contributeGoal,
  deleteGoal,
} from '../controllers/goal.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createGoalSchema, updateGoalSchema, contributeGoalSchema } from '../schemas/fintech.schema.js';
import { ValidationError } from '../middleware/error.middleware.js';

const router = Router();
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function validateIdParam(req: Request, res: Response, next: NextFunction): void {
  if (!uuidRegex.test(req.params.id)) {
    return next(new ValidationError('Invalid goal ID format. Must be a valid UUID.'));
  }
  next();
}

router.get('/', getGoals);
router.get('/:id', validateIdParam, getGoalById);
router.post('/', validateBody(createGoalSchema), createGoal);
router.patch('/:id', validateIdParam, validateBody(updateGoalSchema), updateGoal);
router.post('/:id/contribute', validateIdParam, validateBody(contributeGoalSchema), contributeGoal);
router.delete('/:id', validateIdParam, deleteGoal);

export default router;
