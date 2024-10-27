import { Request, Response } from "express";
import prisma from "../db/prisma";
import {
  api_success_response,
  api_response_error,
} from "../helpers/api_response";
import { sendVerificationOTP as sendVrfOTP } from "../helpers/mail_service_resend";

const sendVerificationOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const email = req.user?.email;
    if (!email) {
      api_response_error(res, 401, "Unauthorized to access");
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.isVerified) {
      api_response_error(res, 409, "User already verified");
      return;
    }

    // generate otp and send email
    const otp = Math.floor(100000 + Math.random() * 900000);
    const mailinfo = await sendVrfOTP(email, otp);
    if (!mailinfo) {
      api_response_error(res, 500, "Failed to send verification email");
      return;
    }

    // database insertion
    await prisma.verficationOtp.create({
      data: {
        userId: user?.id,
        code: String(otp),
        messageId: mailinfo.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expire after 5 minutes
      },
    });
    api_success_response(
      res,
      200,
      "OTP sent successfully. Check email " + email
    );
  } catch (error) {
    api_response_error(res, 500, "Internal server error : " + error);
  }
};

const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const otp = req.body.otp;
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
    });
    if (!user) {
      api_response_error(res, 401, "Unauthorized to access");
      return;
    }
    if (user?.isVerified) {
      api_response_error(res, 409, "User already verified");
      return;
    }
    const verification = await prisma.verficationOtp.findFirst({
      where: {
        userId: user?.id,
        code: otp,
        expiresAt: {
          gt: new Date(),
        }, // check if the code has expired
      },
    });
    if (!verification) {
      api_response_error(res, 400, "Invalid OTP or expired");
      return;
    }
    await prisma.user.update({
      where: { id: user?.id },
      data: { isVerified: true },
    });
    await prisma.verficationOtp.deleteMany({ where: { userId: user?.id } });
    api_success_response(res, 200, "User verified successfully");
  } catch (error) {
    api_response_error(res, 500, "Internal server error : " + error);
  }
};

export { sendVerificationOtp, verifyOtp };
