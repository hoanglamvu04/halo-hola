import nodemailer from 'nodemailer';

function configured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM
  );
}

function transporter() {
  if (!configured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export async function sendSubmissionReceived({ to, name, code, title }) {
  const tx = transporter();
  if (!tx) return { skipped: true };

  await tx.sendMail({
    from: {
      name: process.env.MAIL_FROM_NAME || 'HALO HOLA',
      address: process.env.MAIL_FROM
    },
    to,
    subject: `HALO HOLA đã nhận tác phẩm ${code}`,
    text:
`Xin chào ${name},

HALO HOLA đã nhận tác phẩm "${title}" của bạn.

Mã tác phẩm: ${code}
Trạng thái hiện tại: Đã nhận

Hãy giữ mã này để tra cứu trạng thái tại website HALO HOLA.

Cảm ơn bạn đã kể một góc nhìn về Hòa Lạc.
HALO HOLA 2026`
  });

  return { skipped: false };
}
