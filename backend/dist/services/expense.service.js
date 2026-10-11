import { expenseRepository, } from '../repositories/expense.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';
export class ExpenseService {
    async createExpense(userId, data) {
        // Validate category exists
        const category = await categoryRepository.findById(data.categoryId);
        if (!category) {
            throw new ValidationError('Invalid category specified', [
                { field: 'categoryId', message: 'Category not found or does not exist' },
            ]);
        }
        return expenseRepository.create({
            userId,
            categoryId: data.categoryId,
            amountMinor: data.amountMinor,
            currencyCode: data.currencyCode,
            expenseDate: data.expenseDate,
            note: data.note,
            type: data.type,
            accountId: data.accountId,
            tags: data.tags,
        });
    }
    async getExpenseById(id, userId) {
        const expense = await expenseRepository.findById(id, userId);
        if (!expense) {
            throw new NotFoundError('Expense not found');
        }
        return expense;
    }
    async listExpenses(userId, filters) {
        return expenseRepository.findMany(filters, userId);
    }
    async updateExpense(id, userId, data) {
        // Verify expense exists and belongs to user
        const existing = await expenseRepository.findById(id, userId);
        if (!existing) {
            throw new NotFoundError('Expense not found');
        }
        if (data.categoryId) {
            const category = await categoryRepository.findById(data.categoryId);
            if (!category) {
                throw new ValidationError('Invalid category specified', [
                    { field: 'categoryId', message: 'Category not found or does not exist' },
                ]);
            }
        }
        const updated = await expenseRepository.update(id, userId, {
            categoryId: data.categoryId,
            amountMinor: data.amountMinor,
            currencyCode: data.currencyCode,
            expenseDate: data.expenseDate,
            note: data.note,
            type: data.type,
            accountId: data.accountId,
            tags: data.tags,
        });
        if (!updated) {
            throw new NotFoundError('Expense not found');
        }
        return updated;
    }
    async deleteExpense(id, userId) {
        const existing = await expenseRepository.findById(id, userId);
        if (!existing) {
            throw new NotFoundError('Expense not found');
        }
        const deleted = await expenseRepository.delete(id, userId);
        if (!deleted) {
            throw new Error('Failed to delete expense');
        }
    }
}
export const expenseService = new ExpenseService();
