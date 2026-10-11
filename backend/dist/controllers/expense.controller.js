import { expenseService } from '../services/expense.service.js';
function getUserId(req) {
    return req.user.id;
}
export async function createExpense(req, res, next) {
    try {
        const userId = getUserId(req);
        const expense = await expenseService.createExpense(userId, req.body);
        res.status(201).json({ data: expense });
    }
    catch (error) {
        next(error);
    }
}
export async function listExpenses(req, res, next) {
    try {
        const userId = getUserId(req);
        const query = req.query;
        const result = await expenseService.listExpenses(userId, query);
        res.status(200).json({
            data: result.data,
            meta: result.meta,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function getExpenseById(req, res, next) {
    try {
        const userId = getUserId(req);
        const expense = await expenseService.getExpenseById(req.params.id, userId);
        res.status(200).json({ data: expense });
    }
    catch (error) {
        next(error);
    }
}
export async function updateExpense(req, res, next) {
    try {
        const userId = getUserId(req);
        const updated = await expenseService.updateExpense(req.params.id, userId, req.body);
        res.status(200).json({ data: updated });
    }
    catch (error) {
        next(error);
    }
}
export async function deleteExpense(req, res, next) {
    try {
        const userId = getUserId(req);
        await expenseService.deleteExpense(req.params.id, userId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}
