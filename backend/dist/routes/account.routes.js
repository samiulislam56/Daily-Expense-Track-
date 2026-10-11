import { Router } from 'express';
import { getAccounts, getAccountById, createAccount, updateAccount, deleteAccount, } from '../controllers/account.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createAccountSchema, updateAccountSchema } from '../schemas/fintech.schema.js';
import { ValidationError } from '../middleware/error.middleware.js';
const router = Router();
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function validateIdParam(req, res, next) {
    if (!uuidRegex.test(req.params.id)) {
        return next(new ValidationError('Invalid account ID format. Must be a valid UUID.'));
    }
    next();
}
router.get('/', getAccounts);
router.get('/:id', validateIdParam, getAccountById);
router.post('/', validateBody(createAccountSchema), createAccount);
router.patch('/:id', validateIdParam, validateBody(updateAccountSchema), updateAccount);
router.delete('/:id', validateIdParam, deleteAccount);
export default router;
