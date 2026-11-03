import { Router, type Router as ExpressRouter } from 'express';
import { authController } from '../controllers/authController.js';
import { validateBody } from '../middleware/validation.js';
import { loginSchema } from '../validation/index.js';

const router: ExpressRouter = Router();

router.post('/login', validateBody(loginSchema), (req, res) => authController.login(req, res));
router.get('/check', (req, res) => authController.checkUsers(req, res));

export default router;