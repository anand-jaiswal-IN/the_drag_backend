import nodemailer from "nodemailer";

const sendMail = async (
  recipient: string,
  subject: string,
  text: string,
  html?: string
): Promise<nodemailer.SentMessageInfo> => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      // service: process.env.EMAIL_SERVICE || "hotmail",
      auth: {
        user:
          process.env.EMAIL_USERNAME || "anandjaiswalprofessional@outlook.com",
        pass: process.env.EMAIL_PASSWORD || "Ana@jai1234",
      },
    });
    const info = await transporter.sendMail({
      from: process.env.EMAIL_SENDER,
      to: recipient,
      subject,
      text,
      html,
    });
    return info;
  } catch (err) {
    console.log("Error while sending email : ", err);
    return null;
  }
};

const sendVerificationOTP = async (
  recipient: string,
  otp: number
): Promise<nodemailer.SentMessageInfo> => {
  const text = `Your OTP is ${otp}`;
  return await sendMail(recipient, "OTP", text);
};

export { sendVerificationOTP };
