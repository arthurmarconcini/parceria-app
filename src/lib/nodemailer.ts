// lib/nodemailer.ts

import nodemailer from "nodemailer";

// Assegura que as variáveis de ambiente não são nulas
const email = process.env.EMAIL_SERVER_USER!;
const pass = process.env.EMAIL_SERVER_PASSWORD!;

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false, // true para porta 465, false para outras portas
  auth: {
    user: email,
    pass: pass,
  },
});

export const mailOptions = {
  from: process.env.EMAIL_FROM,
  // 'to' será definido dinamicamente pela API
};
