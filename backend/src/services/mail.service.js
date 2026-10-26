import nodemailer from 'nodemailer';
import { getConnectionConfig, isConnectionConfigured } from './connectionSettings.service.js';

const STATUS_COPY = {
  PENDING: {
    label: 'Đã nhận',
    subject: 'HALO HOLA đã nhận góc nhìn của bạn',
    headline: 'Góc nhìn của bạn đã được ghi nhận.',
    message: 'Ban Tổ chức đang tiếp nhận và kiểm tra nội dung đóng góp. Bạn có thể dùng Mã góc nhìn để theo dõi tiến trình bất cứ lúc nào.'
  },
  VALID: {
    label: 'Hợp lệ',
    subject: 'Góc nhìn của bạn đã được xác nhận hợp lệ',
    headline: 'Góc nhìn đã hoàn tất bước kiểm tra.',
    message: 'Nội dung đóng góp của bạn đã đủ thông tin để tiếp tục trong hành trình biên tập và công bố của HALO HOLA 2026.'
  },
  SHORTLIST: {
    label: 'Được chọn biên tập',
    subject: 'Góc nhìn của bạn được chọn để biên tập trên HALO HOLA',
    headline: 'Góc nhìn của bạn đã bước vào vòng biên tập.',
    message: 'Ban biên tập đã chọn góc nhìn này để tiếp tục hoàn thiện, sắp xếp và cân nhắc giới thiệu trong các bộ sưu tập nội dung của HALO HOLA 2026.'
  },
  TOP52: {
    label: 'TOP52',
    subject: 'Góc nhìn của bạn đã có mặt trong TOP52 HALO HOLA 2026',
    headline: 'Bạn đã có mặt trong TOP52.',
    message: 'Góc nhìn của bạn đã được Ban biên tập lựa chọn vào TOP52 HALO HOLA 2026 — bộ sưu tập 52 lát cắt cùng kể về một Hòa Lạc.'
  },
  AWARDED: {
    label: 'Góc nhìn tiêu biểu',
    subject: 'Góc nhìn của bạn được chọn giới thiệu nổi bật tại HALO HOLA 2026',
    headline: 'Góc nhìn của bạn được chọn giới thiệu nổi bật.',
    message: 'Ban biên tập đã chọn góc nhìn này để giới thiệu như một lát cắt tiêu biểu trong hành trình HALO HOLA 2026. Nếu cần thêm tư liệu hoặc thông tin, chúng tôi sẽ liên hệ với bạn.'
  },
  REJECTED: {
    label: 'Cần bổ sung',
    subject: 'Cập nhật hồ sơ góc nhìn HALO HOLA 2026',
    headline: 'Hồ sơ góc nhìn cần được kiểm tra lại.',
    message: 'Nội dung hiện chưa đủ điều kiện để công bố. Nếu cần bổ sung hoặc làm rõ thông tin, Ban Tổ chức sẽ liên hệ với bạn qua email hoặc số điện thoại đã đăng ký.'
  }
};

function transporter() {
  const config = getConnectionConfig('smtp');
  if (!isConnectionConfigured('smtp', config)) return null;
  return nodemailer.createTransport({
    host: config.host, port: Number(config.port || 587),
    secure: Boolean(config.secure),
    ...(config.user ? { auth: { user: config.user, pass: config.password } } : {})
  });
}

function siteUrl() {
  return String(process.env.HALO_HOLA_SITE_URL || 'https://halohola.vn').replace(/\/$/, '');
}

function lookupUrl(code) {
  return `${siteUrl()}/tra-cuu?code=${encodeURIComponent(code)}`;
}

function fromAddress() {
  const config = getConnectionConfig('smtp');
  return { name: config.fromName || 'HALO HOLA', address: config.fromAddress };
}

export async function verifySmtpConnection() {
  const tx = transporter();
  if (!tx) return { ok: false, message: 'SMTP chưa được cấu hình đầy đủ.' };
  await tx.verify();
  return { ok: true, message: 'Máy chủ SMTP đã xác nhận kết nối và xác thực.' };
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
        <div style="font-size:12px;letter-spacing:.12em;font-weight:700;color:#c45b32">HALO HOLA 2026 · GÓC NHÌN CỘNG ĐỒNG</div>
        <h1 style="font-size:28px;line-height:1.2;margin:10px 0 8px">${escapeHtml(copy.headline)}</h1>
        <p style="font-size:16px;line-height:1.7;margin:0 0 22px">Xin chào ${escapeHtml(name || 'bạn')},</p>
        <p style="font-size:16px;line-height:1.7;margin:0 0 22px">${escapeHtml(copy.message)}</p>
        <div style="background:#f8f6f0;border-radius:16px;padding:18px;margin:0 0 22px">
          <div style="font-size:12px;color:#6d766f;margin-bottom:5px">MÃ GÓC NHÌN</div>
          <div style="font-size:22px;font-weight:800;letter-spacing:.04em">${escapeHtml(code)}</div>
          <div style="margin-top:12px;font-size:14px;line-height:1.5"><b>${escapeHtml(title || 'Góc nhìn HALO HOLA')}</b></div>
          <div style="margin-top:8px;font-size:14px">Trạng thái hiện tại: <b>${escapeHtml(copy.label)}</b></div>
        </div>
        <a href="${escapeHtml(url)}" style="display:inline-block;background:#173d2d;color:#fff;text-decoration:none;padding:13px 20px;border-radius:999px;font-weight:700">Theo dõi góc nhìn</a>
        <p style="font-size:13px;color:#69736d;line-height:1.6;margin:24px 0 0">Bạn có thể mở trang theo dõi bất cứ lúc nào bằng Mã góc nhìn và email đã dùng khi gửi nội dung.</p>
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
Trạng thái hiện tại: Đã nhận

Theo dõi góc nhìn: ${url}

Cảm ơn bạn đã đóng góp một góc nhìn về Hòa Lạc.
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
Trạng thái hiện tại: ${copy.label}

Theo dõi góc nhìn: ${url}

HALO HOLA 2026`,
    html: statusEmailHtml({ name, code, title, status })
  });

  return { skipped: false, status, label: copy.label };
}

export function getSubmissionStatusLabel(status) {
  return STATUS_COPY[status]?.label || status;
}


export async function sendCommunityLoginCode({to,code,expiresInMinutes=10}) {
  const tx=transporter();
  if(!tx)return {skipped:true,reason:'SMTP_NOT_CONFIGURED'};
  const accountUrl=`${siteUrl()}/tai-khoan`;
  await tx.sendMail({
    from:fromAddress(),
    to,
    subject:'Mã đăng nhập HALO HOLA',
    text:`Mã đăng nhập HALO HOLA của bạn là: ${code}

Mã có hiệu lực trong ${expiresInMinutes} phút.
Không chia sẻ mã này cho người khác.

Tài khoản: ${accountUrl}
HALO HOLA`,
    html:`<!doctype html><html lang="vi"><body style="margin:0;background:#f7f3ea;font-family:Arial,sans-serif;color:#173d2d"><div style="max-width:560px;margin:0 auto;padding:32px 18px"><div style="background:#fff;border:1px solid #e8dfd0;border-radius:24px;padding:30px"><div style="font-size:12px;letter-spacing:.12em;font-weight:700;color:#c45b32">HALO HOLA · TÀI KHOẢN CỘNG ĐỒNG</div><h1 style="font-size:26px;margin:10px 0 8px">Mã đăng nhập của bạn</h1><p style="font-size:15px;line-height:1.6">Nhập mã dưới đây để xác minh email và mở hồ sơ đóng góp.</p><div style="margin:22px 0;padding:18px;border-radius:16px;background:#f8f6f0;text-align:center;font-size:32px;font-weight:800;letter-spacing:.18em">${escapeHtml(code)}</div><p style="font-size:13px;color:#69736d;line-height:1.6">Mã có hiệu lực trong ${expiresInMinutes} phút. Không chia sẻ mã này cho người khác.</p><a href="${escapeHtml(accountUrl)}" style="display:inline-block;margin-top:8px;background:#173d2d;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">Mở tài khoản HALO HOLA</a></div></div></body></html>`
  });
  return {skipped:false};
}
