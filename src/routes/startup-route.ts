import express from 'express';
import { Create_Startup, Get_All_Startups } from "../controllers/startup-controller";

const router = express.Router();

router.post('/create-startup', Create_Startup);
router.get("/", Get_All_Startups);


export default router;