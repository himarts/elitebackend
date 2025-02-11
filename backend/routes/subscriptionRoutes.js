import express from "express";
import { getSubscription } from "../controllers/subscriptionController";


const router = express.Router();
router.get("/getsub",getSubscription );


export default router;