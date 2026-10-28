import { Router } from 'express';
import { authController } from '../controllers/authController.js';

const router = Router();

router.post('/login', (req, res) => authController.login(req, res));
router.get('/check', (req, res) => authController.checkUsers(req, res));

export default router;