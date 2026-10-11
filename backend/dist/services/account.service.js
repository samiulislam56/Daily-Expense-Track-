import { accountRepository } from '../repositories/account.repository.js';
export class AccountService {
    async getAccounts(userId) {
        return accountRepository.findMany(userId);
    }
    async getAccountById(id, userId) {
        return accountRepository.findById(id, userId);
    }
    async createAccount(userId, data) {
        return accountRepository.create({
            userId,
            name: data.name,
            type: data.type,
            balanceMinor: data.balanceMinor ?? 0,
            currencyCode: data.currencyCode ?? 'BDT',
            isDefault: data.isDefault ?? false,
        });
    }
    async updateAccount(id, userId, data) {
        return accountRepository.update(id, userId, data);
    }
    async deleteAccount(id, userId) {
        return accountRepository.delete(id, userId);
    }
}
export const accountService = new AccountService();
