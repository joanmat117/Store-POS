import { Router, type Router as ExpressRouter } from 'express';
import { usersController } from '../controllers/usersController.js';
import { authenticate, requirePerm } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { userCreateSchema, userUpdateSchema } from '../validation/index.js';

const router: ExpressRouter = Router();
router.use(authenticate);
router.use(requirePerm('perm_users'));

router.get('/', (req, res) => usersController.getUsers(req, res));
router.get('/:id', (req, res) => usersController.getUser(req, res));
router.post('/', validateBody(userCreateSchema), (req, res) => usersController.createUser(req, res));
router.put('/:id', validateBody(userUpdateSchema), (req, res) => usersController.updateUser(req, res));
router.delete('/:id', (req, res) => usersController.deleteUser(req, res));
router.post('/:id/logout', (req, res) => usersController.logoutUser(req, res));

export default router;