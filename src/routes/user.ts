import { Router } from "express";
import { sendVerificationOtp, verifyOtp } from "../controllers/user.controller";

const router = Router();

router.post("/send-otp", sendVerificationOtp);
router.post("/verify-otp", verifyOtp);

export default router;
