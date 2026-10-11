import { Router } from 'express';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import expenseRoutes from './expense.routes.js';
import summaryRoutes from './summary.routes.js';
import balanceRoutes from './balance.routes.js';
import accountRoutes from './account.routes.js';
import budgetRoutes from './budget.routes.js';
import goalRoutes from './goal.routes.js';
import recurringRoutes from './recurring.routes.js';
import copilotRoutes from './copilot.routes.js';
import { requireAuth } from '../middleware/auth.middleware.js';
const apiRouter = Router();
// Public authentication & category metadata routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/categories', categoryRoutes);
// Protected financial & ledger routes strictly isolated by authenticated user
apiRouter.use('/expenses', requireAuth, expenseRoutes);
apiRouter.use('/summary', requireAuth, summaryRoutes);
apiRouter.use('/balance', requireAuth, balanceRoutes);
apiRouter.use('/accounts', requireAuth, accountRoutes);
apiRouter.use('/budgets', requireAuth, budgetRoutes);
apiRouter.use('/goals', requireAuth, goalRoutes);
apiRouter.use('/recurring', requireAuth, recurringRoutes);
apiRouter.use('/copilot', requireAuth, copilotRoutes);
export default apiRouter;
