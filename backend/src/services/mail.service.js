import nodemailer from 'nodemailer';

const STATUS_COPY = {
  PENDING: {
    label: 'Đã nhận',
    subject: 'HALO HOLA đã nhận hồ sơ của bạn',
    headline: 'Góc nhìn của bạn đã được ghi nhận.',
    message: 'Ban Tổ chức đang tiếp nhận và kiểm tra hồ sơ. Bạn có thể dùng Mã dự thi để theo dõi tiến trình bất cứ lúc nào.'
  },
  VALID: {
    label: 'Hợp lệ',
    subject: 'Tác phẩm của bạn đã được xác nhận hợp lệ',
    headline: 'Hồ sơ đã vượt qua bước kiểm tra hợp lệ.',
    message: 'Tác phẩm của bạn đã đủ điều kiện để tiếp tục trong quy trình tuyển chọn HALO HOLA 2026.'
  },
  SHORTLIST: {
    label: 'Shortlist',
    subject: 'Tác phẩm của bạn đã vào Shortlist HALO HOLA',
    headline: 'Một cột mốc mới cho góc nhìn của bạn.',
    message: 'Tác phẩm đã được đưa vào Shortlist và tiếp tục bước đánh giá của Hội đồng giám khảo.'
  },
  TOP52: {
    label: 'TOP52',
    subject: 'Chúc mừng! Tác phẩm của bạn vào TOP52 HALO HOLA 2026',
    headline: 'Bạn đã có mặt trong TOP52.',
    message: 'Góc nhìn của bạn đã được lựa chọn vào TOP52 HALO HOLA 2026. Ban Tổ chức sẽ tiếp tục cập nhật các mốc công bố tiếp theo.'
  },
  AWARDED: {
    label: 'Đạt giải',
    subject: 'Chúc mừng! Tác phẩm của bạn đạt giải HALO HOLA 2026',
    headline: 'Góc nhìn của bạn đã được vinh danh.',
    message: 'Tác phẩm đã được ghi nhận ở trạng thái Đạt giải. Ban Tổ chức sẽ liên hệ thêm qua thông tin bạn đã cung cấp.'
  },
  REJECTED: {
    label: 'Không hợp lệ',
    subject: 'Cập nhật hồ sơ dự thi HALO HOLA 2026',
    headline: 'Hồ sơ cần được kiểm tra lại.',
    message: 'Tác phẩm hiện được ghi nhận là chưa hợp lệ. Nếu cần bổ sung hoặc làm rõ thông tin, Ban Tổ chức sẽ liên hệ với bạn qua email hoặc số điện thoại đã đăng ký.'
  }
};

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

function siteUrl() {
  return String(process.env.HALO_HOLA_SITE_URL || 'https://halohola.xspace.vn').replace(/\/$/, '');
}

function lookupUrl(code) {
  return `${siteUrl()}/tra-cuu?code=${encodeURIComponent(code)}`;
}

function fromAddress() {
  return {
    name: process.env.MAIL_FROM_NAME || 'HALO HOLA',
    address: process.env.MAIL_FROM
  };
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function statusEmailHtml({ name, code, title, status }) {
  const copy = STATUS_COPY[status] || STATUS_COPY.PENDING;
  const url = lookupUrl(code);
  return `<!doctype html>
<html lang="vi">
  <body style="margin:0;background:#f7f3ea;font-family:Arial,sans-serif;color:#173d2d">
    <div style="max-width:620px;margin:0 auto;padding:32px 18px">
      <div style="background:#ffffff;border:1px solid #e8dfd0;border-radius:24px;padding:30px;box-shadow:0 12px 36px rgba(23,61,45,.08)">
        <div style="font-size:12px;letter-spacing:.12em;font-weight:700;color:#c45b32">HALO HOLA 2026</div>
        <h1 style="font-size:28px;line-height:1.2;margin:10px 0 8px">${escapeHtml(copy.headline)}</h1>
        <p style="font-size:16px;line-height:1.7;margin:0 0 22px">Xin chào ${escapeHtml(name || 'bạn')},</p>
        <p style="font-size:16px;line-height:1.7;margin:0 0 22px">${escapeHtml(copy.message)}</p>
        <div style="background:#f8f6f0;border-radius:16px;padding:18px;margin:0 0 22px">
          <div style="font-size:12px;color:#6d766f;margin-bottom:5px">MÃ DỰ THI</div>
          <div style="font-size:22px;font-weight:800;letter-spacing:.04em">${escapeHtml(code)}</div>
          <div style="margin-top:12px;font-size:14px;line-height:1.5"><b>${escapeHtml(title || 'Tác phẩm')}</b></div>
          <div style="margin-top:8px;font-size:14px">Trạng thái hiện tại: <b>${escapeHtml(copy.label)}</b></div>
        </div>
        <a href="${escapeHtml(url)}" style="display:inline-block;background:#173d2d;color:#fff;text-decoration:none;padding:13px 20px;border-radius:999px;font-weight:700">Tra cứu bài dự thi</a>
        <p style="font-size:13px;color:#69736d;line-height:1.6;margin:24px 0 0">Bạn có thể mở trang tra cứu bất cứ lúc nào bằng Mã dự thi và email đã dùng khi gửi bài.</p>
      </div>
    </div>
  </body>
</html>`;
}

export async function sendSubmissionReceived({ to, name, code, title }) {
  const tx = transporter();
  if (!tx) return { skipped: true, reason: 'SMTP_NOT_CONFIGURED' };
  const url = lookupUrl(code);

  await tx.sendMail({
    from: fromAddress(),
    to,
    subject: `HALO HOLA đã nhận tác phẩm ${code}`,
    text:
`Xin chào ${name},

HALO HOLA đã nhận tác phẩm "${title}" của bạn.

Mã tác phẩm: ${code}
Trạng thái hiện tại: Đã nhận

Tra cứu bài dự thi: ${url}

Cảm ơn bạn đã kể một góc nhìn về Hòa Lạc.
HALO HOLA 2026`,
    html: statusEmailHtml({ name, code, title, status: 'PENDING' })
  });

  return { skipped: false };
}

export async function sendSubmissionStatusUpdate({ to, name, code, title, status }) {
  const tx = transporter();
  if (!tx) return { skipped: true, reason: 'SMTP_NOT_CONFIGURED' };
  const copy = STATUS_COPY[status] || STATUS_COPY.PENDING;
  const url = lookupUrl(code);

  await tx.sendMail({
    from: fromAddress(),
    to,
    subject: `${copy.subject} · ${code}`,
    text:
`Xin chào ${name || 'bạn'},

${copy.message}

Tác phẩm: ${title || 'Tác phẩm HALO HOLA'}
Mã dự thi: ${code}
Trạng thái hiện tại: ${copy.label}

Tra cứu bài dự thi: ${url}

HALO HOLA 2026`,
    html: statusEmailHtml({ name, code, title, status })
  });

  return { skipped: false, status, label: copy.label };
}

export function getSubmissionStatusLabel(status) {
  return STATUS_COPY[status]?.label || status;
}
