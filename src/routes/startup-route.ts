import express from 'express';
import {
    Create_Startup,
    Get_All_Startups,
    Get_Startup_By_Id,
    Get_Startups_By_User_Id
} from "../controllers/startup-controller";

const router = express.Router();

router.post('/create-startup', Create_Startup);

// Get all startups
router.get("/", Get_All_Startups);

// Get startup by startup ID
router.get("/startup/:id", Get_Startup_By_Id);

// Get all startups by user ID
router.get("/user/:userId", Get_Startups_By_User_Id);

export default router;
