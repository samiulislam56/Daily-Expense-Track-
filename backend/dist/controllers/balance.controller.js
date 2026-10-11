import { balanceService } from '../services/balance.service.js';
function getUserId(req) {
    return req.user.id;
}
export async function getBalance(req, res, next) {
    try {
        const userId = getUserId(req);
        const summary = await balanceService.getBalanceSummary(userId);
        res.status(200).json({ data: summary });
    }
    catch (error) {
        next(error);
    }
}
export async function updateBalance(req, res, next) {
    try {
        const userId = getUserId(req);
        const summary = await balanceService.setBalance(userId, req.body);
        res.status(200).json({ data: summary });
    }
    catch (error) {
        next(error);
    }
}
