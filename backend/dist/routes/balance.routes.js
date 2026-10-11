import { Router } from 'express';
import { getBalance, updateBalance } from '../controllers/balance.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { updateBalanceSchema } from '../schemas/balance.schema.js';
const router = Router();
router.get('/', getBalance);
router.put('/', validateBody(updateBalanceSchema), updateBalance);
router.post('/', validateBody(updateBalanceSchema), updateBalance);
export default router;
