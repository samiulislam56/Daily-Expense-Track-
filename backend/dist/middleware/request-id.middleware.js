import crypto from 'crypto';
export function requestIdMiddleware(req, res, next) {
    const headerId = req.headers['x-request-id'];
    const reqId = (Array.isArray(headerId) ? headerId[0] : headerId) || crypto.randomUUID();
    req.id = reqId;
    res.setHeader('X-Request-Id', reqId);
    next();
}
