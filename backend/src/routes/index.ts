import { Router } from 'express';
import categoryRoutes from './category.routes.js';
import expenseRoutes from './expense.routes.js';
import summaryRoutes from './summary.routes.js';
import balanceRoutes from './balance.routes.js';

const apiRouter = Router();

apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/expenses', expenseRoutes);
apiRouter.use('/summary', summaryRoutes);
apiRouter.use('/balance', balanceRoutes);

export default apiRouter;
