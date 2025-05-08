import express from 'express';
import { Create_Startup } from '../controllers/startup-controller';

const router = express.Router();

router.post('/create-startup', Create_Startup);


export default router;