import { recurringRepository, RecurringTransactionDTO } from '../repositories/recurring.repository.js';
import { expenseRepository } from '../repositories/expense.repository.js';

export class RecurringService {
  async getRecurring(userId: string): Promise<RecurringTransactionDTO[]> {
    return recurringRepository.findMany(userId);
  }

  async getRecurringById(id: string, userId: string): Promise<RecurringTransactionDTO | null> {
    return recurringRepository.findById(id, userId);
  }

  async createRecurring(
    userId: string,
    data: {
      type: 'expense' | 'income';
      amountMinor: number;
      categoryId: string;
      accountId?: string | null;
      frequency: 'weekly' | 'monthly';
      nextDueDate: string;
      note?: string | null;
      isActive?: boolean;
    }
  ): Promise<RecurringTransactionDTO> {
    return recurringRepository.create({
      userId,
      type: data.type,
      amountMinor: data.amountMinor,
      categoryId: data.categoryId,
      accountId: data.accountId,
      frequency: data.frequency,
      nextDueDate: data.nextDueDate,
      note: data.note,
      isActive: data.isActive,
    });
  }

  async updateRecurring(
    id: string,
    userId: string,
    data: {
      type?: 'expense' | 'income';
      amountMinor?: number;
      categoryId?: string;
      accountId?: string | null;
      frequency?: 'weekly' | 'monthly';
      nextDueDate?: string;
      note?: string | null;
      isActive?: boolean;
    }
  ): Promise<RecurringTransactionDTO | null> {
    return recurringRepository.update(id, userId, data);
  }

  async deleteRecurring(id: string, userId: string): Promise<boolean> {
    return recurringRepository.delete(id, userId);
  }

  async processPayment(id: string, userId: string): Promise<{ recurring: RecurringTransactionDTO; transactionId: string }> {
    const recurring = await recurringRepository.findById(id, userId);
    if (!recurring) {
      throw new Error('Recurring payment template not found');
    }

    const today = new Date().toISOString().split('T')[0];

    // 1. Record transaction
    const transaction = await expenseRepository.create({
      userId,
      amountMinor: recurring.amountMinor,
      currencyCode: 'BDT',
      categoryId: recurring.categoryId,
      accountId: recurring.accountId,
      type: recurring.type,
      expenseDate: today,
      note: recurring.note || `Auto-payment: ${recurring.categoryName || 'Recurring'}`,
      tags: 'recurring',
    });

    // 2. Advance next due date
    const currentDate = new Date(recurring.nextDueDate);
    if (recurring.frequency === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    const nextDueDate = currentDate.toISOString().split('T')[0];

    const updated = await recurringRepository.update(id, userId, { nextDueDate });
    if (!updated) throw new Error('Failed to update next due date');

    return {
      recurring: updated,
      transactionId: transaction.id,
    };
  }
}

export const recurringService = new RecurringService();
