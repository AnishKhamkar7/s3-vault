import nodemailer from 'nodemailer';
import { env } from './env';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

const smtpConfig: SMTPTransport.Options = {
  host: env.NODEMAILER_HOST,
  port: Number(env.NODEMAILER_PORT),
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: env.NODEMAILER_EMAIL,
    pass: env.NODEMAILER_PASSWORD,
  },
};

const transport = nodemailer.createTransport(smtpConfig);

export const sendEmail = async (
  to: string,
  { subject, text, html }: { subject: string; text?: string; html?: string }
) => {
  await transport.sendMail({ from: env.NODEMAILER_EMAIL, to, text, subject, html });
};
