import express from 'express';
import { SignUp, login } from '../controllers/auth-controller';

const router = express.Router();

router.post('/login', login);
router.post('/register', SignUp);

export default router;
