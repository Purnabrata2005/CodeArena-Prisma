import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

let transporter: nodemailer.Transporter | undefined;

const getTransporter = (): nodemailer.Transporter => {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST || process.env.MAILTRAP_HOST;
  const smtpPort = process.env.SMTP_PORT || process.env.MAILTRAP_PORT;
  const smtpUser = process.env.SMTP_USER || process.env.MAILTRAP_USERNAME;
  const smtpPass = process.env.SMTP_PASS || process.env.MAILTRAP_PASSWORD;

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort) || 587,
    secure: Number(smtpPort) === 465, // true for port 465, false for other ports
    pool: true, // Enable SMTP connection pooling
    maxConnections: 5, // Max connections to maintain
    maxMessages: 100, // Max messages per connection
    auth: smtpUser && smtpPass ? {
      user: smtpUser,
      pass: smtpPass,
    } : undefined,
  } as any);

  return transporter;
};

interface SendEmailOptions {
  email: string;
  subject: string;
  mailgenContent: any;
  username?: string;
}

const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  // Initialize mailgen instance with default theme and brand configuration
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "CodeArena",
      link: "https://taskmanager.app",
    },
  });

  // Generate the plaintext version of the e-mail (for clients that do not support HTML)
  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  // Generate an HTML email with the provided contents
  const emailHtml = mailGenerator.generate(options.mailgenContent);

  const senderEmail = process.env.SMTP_SENDEREMAIL || process.env.MAILTRAP_SENDEREMAIL || "noreply@codearena.com";

  // Get or initialize the pooled transporter
  const transporterInstance = getTransporter();

  const mail = {
    from: senderEmail,
    to: options.email, // receiver's mail
    subject: options.subject, // mail subject
    text: emailTextual, // mailgen content textual variant
    html: emailHtml, // mailgen content html variant
  };

  try {
    await transporterInstance.sendMail(mail);
  } catch (error) {
    // As sending email is not strongly coupled to the business logic it is not worth to raise an error when email sending fails
    // So it's better to fail silently rather than breaking the app
    console.error(
      "Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file"
    );
    console.error("Error: ", error);
  }
};

const emailVerificationMailgenContent = (username: string, verificationUrl: string) => {
  return {
    body: {
      name: username,
      intro: "Welcome to CoderArena! We're very excited to have you on board.",
      action: {
        instructions:
          "To verify your email please click on the following button:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

const forgotPasswordMailgenContent = (username: string, passwordResetUrl: string) => {
  return {
    body: {
      name: username,
      intro: "You have requested to reset your password.",
      action: {
        instructions:
          "To reset your password click on the following button or link:",
        button: {
          color: "#efbc05", // Optional action button color
          text: "Reset password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};
