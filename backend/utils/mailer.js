const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM) {
    if (process.env.NODE_ENV === 'production') throw new Error('Email provider is not configured. Set RESEND_API_KEY and MAIL_FROM.');
    console.warn(`✉️ Email not sent in development. To: ${to}, Subject: ${subject}`);
    console.warn(html);
    return { skipped: true };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, html }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Email provider rejected request: ${text.slice(0, 500)}`);
  }
  return response.json();
};
module.exports = { sendEmail };
