import { authService } from '../services/auth.service.js';
export async function register(req, res, next) {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({ data: result });
    }
    catch (error) {
        next(error);
    }
}
export async function login(req, res, next) {
    try {
        const result = await authService.login(req.body);
        res.status(200).json({ data: result });
    }
    catch (error) {
        next(error);
    }
}
export async function getMe(req, res, next) {
    try {
        const userId = req.user.id;
        const user = await authService.getMe(userId);
        res.status(200).json({ data: user });
    }
    catch (error) {
        next(error);
    }
}
export async function logout(req, res) {
    // Stateless JWT tokens are cleared on the client side
    res.status(200).json({ data: { message: 'Logged out successfully' } });
}
