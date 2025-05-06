import express from 'express';
import { SignUp, login } from '../controllers/auth-controller';

const router = express.Router();

router.post('/login', login);
router.post('/signup', SignUp);

export default router;
