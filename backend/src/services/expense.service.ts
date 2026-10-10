import {
  expenseRepository,
  ExpenseDTO,
  ExpenseFilterParams,
  PaginatedResult,
} from '../repositories/expense.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';
import { CreateExpenseInput, UpdateExpenseInput } from '../schemas/expense.schema.js';

export class ExpenseService {
  async createExpense(userId: string, data: CreateExpenseInput): Promise<ExpenseDTO> {
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

  async getExpenseById(id: string, userId: string): Promise<ExpenseDTO> {
    const expense = await expenseRepository.findById(id, userId);
    if (!expense) {
      throw new NotFoundError('Expense not found');
    }
    return expense;
  }

  async listExpenses(userId: string, filters: ExpenseFilterParams): Promise<PaginatedResult<ExpenseDTO>> {
    return expenseRepository.findMany(filters, userId);
  }

  async updateExpense(id: string, userId: string, data: UpdateExpenseInput): Promise<ExpenseDTO> {
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

  async deleteExpense(id: string, userId: string): Promise<void> {
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
