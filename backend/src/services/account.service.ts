import { accountRepository, AccountDTO } from '../repositories/account.repository.js';

export class AccountService {
  async getAccounts(userId: string): Promise<AccountDTO[]> {
    return accountRepository.findMany(userId);
  }

  async getAccountById(id: string, userId: string): Promise<AccountDTO | null> {
    return accountRepository.findById(id, userId);
  }

  async createAccount(
    userId: string,
    data: {
      name: string;
      type: 'cash' | 'bank' | 'mobile_wallet' | 'other';
      balanceMinor?: number;
      currencyCode?: string;
      isDefault?: boolean;
    }
  ): Promise<AccountDTO> {
    return accountRepository.create({
      userId,
      name: data.name,
      type: data.type,
      balanceMinor: data.balanceMinor ?? 0,
      currencyCode: data.currencyCode ?? 'BDT',
      isDefault: data.isDefault ?? false,
    });
  }

  async updateAccount(
    id: string,
    userId: string,
    data: {
      name?: string;
      type?: 'cash' | 'bank' | 'mobile_wallet' | 'other';
      balanceMinor?: number;
      currencyCode?: string;
      isDefault?: boolean;
    }
  ): Promise<AccountDTO | null> {
    return accountRepository.update(id, userId, data);
  }

  async deleteAccount(id: string, userId: string): Promise<boolean> {
    return accountRepository.delete(id, userId);
  }
}

export const accountService = new AccountService();
