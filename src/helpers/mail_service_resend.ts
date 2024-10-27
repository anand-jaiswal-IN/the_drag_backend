import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

if (resend == null) {
  throw new Error("Resend API key is not set");
}

const sendMail = async (
  recipient: string,
  subject: string,
  text: string,
  html?: string
) => {
  const { data, error } = await resend.emails.send({
    from: `The Drag <onboarding@resend.dev>`,
    to: recipient,
    subject,
    text,
    html,
  });

  if (error) console.log("Error while sending email : ", error);

  return data;
};

const sendVerificationOTP = async (recipient: string, otp: number) => {
  const text = `Your OTP is ${otp}`;
  return await sendMail(recipient, "Verfication OTP", text);
};

export { sendVerificationOTP };
export default sendMail;
