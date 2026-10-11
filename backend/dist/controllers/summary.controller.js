import { summaryService } from '../services/summary.service.js';
function getUserId(req) {
    return req.user.id;
}
export async function getDailySummary(req, res, next) {
    try {
        const userId = getUserId(req);
        const date = req.query.date;
        const summary = await summaryService.getDailySummary(date, userId);
        res.status(200).json({ data: summary });
    }
    catch (error) {
        next(error);
    }
}
export async function getMonthlySummary(req, res, next) {
    try {
        const userId = getUserId(req);
        const month = req.query.month;
        const summary = await summaryService.getMonthlySummary(month, userId);
        res.status(200).json({ data: summary });
    }
    catch (error) {
        next(error);
    }
}
export async function getCategorySummary(req, res, next) {
    try {
        const userId = getUserId(req);
        const from = req.query.from;
        const to = req.query.to;
        const categories = await summaryService.getCategorySummary(userId, from, to);
        res.status(200).json({ data: categories });
    }
    catch (error) {
        next(error);
    }
}
