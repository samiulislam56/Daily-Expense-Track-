import { copilotService } from '../services/copilot.service.js';
function getUserId(req) {
    return req.user.id;
}
export async function askCopilot(req, res, next) {
    try {
        const userId = getUserId(req);
        const { query } = req.body;
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            res.status(400).json({ error: 'Query is required' });
            return;
        }
        const result = await copilotService.processQuery(userId, query.trim());
        res.status(200).json({ data: result });
    }
    catch (error) {
        next(error);
    }
}
