import { recurringService } from '../services/recurring.service.js';
function getUserId(req) {
    return req.user.id;
}
export async function getRecurring(req, res, next) {
    try {
        const userId = getUserId(req);
        const recurring = await recurringService.getRecurring(userId);
        res.status(200).json({ data: recurring });
    }
    catch (error) {
        next(error);
    }
}
export async function getRecurringById(req, res, next) {
    try {
        const userId = getUserId(req);
        const item = await recurringService.getRecurringById(req.params.id, userId);
        if (!item) {
            res.status(404).json({ error: 'Recurring payment not found' });
            return;
        }
        res.status(200).json({ data: item });
    }
    catch (error) {
        next(error);
    }
}
export async function createRecurring(req, res, next) {
    try {
        const userId = getUserId(req);
        const item = await recurringService.createRecurring(userId, req.body);
        res.status(201).json({ data: item });
    }
    catch (error) {
        next(error);
    }
}
export async function updateRecurring(req, res, next) {
    try {
        const userId = getUserId(req);
        const item = await recurringService.updateRecurring(req.params.id, userId, req.body);
        if (!item) {
            res.status(404).json({ error: 'Recurring payment not found' });
            return;
        }
        res.status(200).json({ data: item });
    }
    catch (error) {
        next(error);
    }
}
export async function processPayment(req, res, next) {
    try {
        const userId = getUserId(req);
        const result = await recurringService.processPayment(req.params.id, userId);
        res.status(200).json({ data: result });
    }
    catch (error) {
        next(error);
    }
}
export async function deleteRecurring(req, res, next) {
    try {
        const userId = getUserId(req);
        const deleted = await recurringService.deleteRecurring(req.params.id, userId);
        if (!deleted) {
            res.status(404).json({ error: 'Recurring payment not found' });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}
