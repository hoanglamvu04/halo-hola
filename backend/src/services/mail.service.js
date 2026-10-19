import nodemailer from 'nodemailer';

const STATUS_COPY = {
  PENDING: {
    label: 'Đã nhận',
    subject: 'HALO HOLA đã nhận góc nhìn của bạn',
    headline: 'Câu chuyện của bạn đã đến với HALO HOLA.',
    message: 'Ban Biên tập đang đọc nội dung và kiểm tra những thông tin cơ bản. Bạn có thể dùng Mã góc nhìn để theo dõi hành trình bất cứ lúc nào.'
  },
  VALID: {
    label: 'Đã xác minh',
    subject: 'Góc nhìn của bạn đã hoàn tất bước xác minh',
    headline: 'Thông tin cơ bản đã được xác minh.',
    message: 'Nguồn và thông tin chính của góc nhìn đã đủ để Ban Biên tập tiếp tục phát triển câu chuyện trong hành trình HALO HOLA 2026.'
  },
  SHORTLIST: {
    label: 'Đang biên tập',
    subject: 'Góc nhìn của bạn đang được HALO HOLA biên tập',
    headline: 'Câu chuyện đang được phát triển sâu hơn.',
    message: 'Ban Biên tập đang hoàn thiện cách kể, tư liệu, hình ảnh và thông tin nguồn để xem xét công bố góc nhìn trong hệ thống HALO HOLA.'
  },
  TOP52: {
    label: 'Trong 52 góc nhìn',
    subject: 'Góc nhìn của bạn có mặt trong 52 góc nhìn HALO HOLA 2026',
    headline: 'Một câu chuyện của bạn đã trở thành một phần của 52 góc nhìn.',
    message: 'Góc nhìn đã được Ban Biên tập lựa chọn vào bộ 52 câu chuyện đại diện cho một Hòa Lạc năm 2026 và sẽ được giới thiệu trong hành trình công bố của chương trình.'
  },
  AWARDED: {
    label: 'Đã ghi nhận',
    subject: 'HALO HOLA cập nhật ghi nhận cho góc nhìn của bạn',
    headline: 'Góc nhìn của bạn đã được ghi nhận.',
    message: 'Câu chuyện đã được ghi nhận trong hành trình HALO HOLA 2026. Ban Biên tập sẽ liên hệ thêm nếu có hoạt động triển lãm, Calendar hoặc nội dung tiếp nối cần sự phối hợp của bạn.'
  },
  REJECTED: {
    label: 'Cần bổ sung',
    subject: 'HALO HOLA cần bổ sung thông tin cho góc nhìn của bạn',
    headline: 'Góc nhìn cần thêm thông tin trước khi tiếp tục.',
    message: 'Ban Biên tập chưa có đủ dữ liệu để xác minh hoặc công bố câu chuyện. Nếu cần bổ sung nguồn, quyền sử dụng hoặc chi tiết nhân vật/địa điểm, chúng tôi sẽ liên hệ qua thông tin bạn đã cung cấp.'
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
  return String(process.env.HALO_HOLA_SITE_URL || 'https://halohola.vn').replace(/\/$/, '');
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
        <div style="font-size:12px;letter-spacing:.12em;font-weight:700;color:#c45b32">HALO HOLA 2026 · 52 GÓC NHÌN · 1 HÒA LẠC</div>
        <h1 style="font-size:28px;line-height:1.2;margin:10px 0 8px">${escapeHtml(copy.headline)}</h1>
        <p style="font-size:16px;line-height:1.7;margin:0 0 22px">Xin chào ${escapeHtml(name || 'bạn')},</p>
        <p style="font-size:16px;line-height:1.7;margin:0 0 22px">${escapeHtml(copy.message)}</p>
        <div style="background:#f8f6f0;border-radius:16px;padding:18px;margin:0 0 22px">
          <div style="font-size:12px;color:#6d766f;margin-bottom:5px">MÃ GÓC NHÌN</div>
          <div style="font-size:22px;font-weight:800;letter-spacing:.04em">${escapeHtml(code)}</div>
          <div style="margin-top:12px;font-size:14px;line-height:1.5"><b>${escapeHtml(title || 'Góc nhìn HALO HOLA')}</b></div>
          <div style="margin-top:8px;font-size:14px">Hành trình hiện tại: <b>${escapeHtml(copy.label)}</b></div>
        </div>
        <a href="${escapeHtml(url)}" style="display:inline-block;background:#173d2d;color:#fff;text-decoration:none;padding:13px 20px;border-radius:999px;font-weight:700">Theo dõi hành trình</a>
        <p style="font-size:13px;color:#69736d;line-height:1.6;margin:24px 0 0">Bạn có thể mở trang theo dõi bất cứ lúc nào bằng Mã góc nhìn và email đã dùng khi gửi. HALO HOLA không tìm người thắng — chúng tôi tìm những câu chuyện đáng được giữ lại.</p>
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
    subject: `HALO HOLA đã nhận góc nhìn ${code}`,
    text:
`Xin chào ${name},

HALO HOLA đã nhận góc nhìn "${title}" của bạn.

Mã góc nhìn: ${code}
Hành trình hiện tại: Đã nhận

Theo dõi hành trình: ${url}

Cảm ơn bạn đã kể cho HALO HOLA một điều đáng được giữ lại về Hòa Lạc.
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

Góc nhìn: ${title || 'Góc nhìn HALO HOLA'}
Mã góc nhìn: ${code}
Hành trình hiện tại: ${copy.label}

Theo dõi hành trình: ${url}

HALO HOLA 2026`,
    html: statusEmailHtml({ name, code, title, status })
  });

  return { skipped: false, status, label: copy.label };
}

export function getSubmissionStatusLabel(status) {
  return STATUS_COPY[status]?.label || status;
}
