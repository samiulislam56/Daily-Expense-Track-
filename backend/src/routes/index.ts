import { Router } from 'express';
import categoryRoutes from './category.routes.js';
import expenseRoutes from './expense.routes.js';
import summaryRoutes from './summary.routes.js';
import balanceRoutes from './balance.routes.js';
import accountRoutes from './account.routes.js';
import budgetRoutes from './budget.routes.js';
import goalRoutes from './goal.routes.js';
import recurringRoutes from './recurring.routes.js';
import copilotRoutes from './copilot.routes.js';

const apiRouter = Router();

apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/expenses', expenseRoutes);
apiRouter.use('/summary', summaryRoutes);
apiRouter.use('/balance', balanceRoutes);
apiRouter.use('/accounts', accountRoutes);
apiRouter.use('/budgets', budgetRoutes);
apiRouter.use('/goals', goalRoutes);
apiRouter.use('/recurring', recurringRoutes);
apiRouter.use('/copilot', copilotRoutes);

export default apiRouter;
