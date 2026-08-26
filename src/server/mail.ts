const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

type SendEmailArgs = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, toName, subject, html }: SendEmailArgs): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn(`[mail] BREVO_API_KEY not set — skipping email "${subject}" to ${to}`);
    return;
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@sarvpratham.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Sarvpratham Analytics";

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo email send failed (${res.status}): ${body}`);
  }
}

function emailShell(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a2e;">
      <h2 style="margin: 0 0 16px; font-size: 20px;">${title}</h2>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #888;">Sarvpratham Analytics</p>
    </div>
  `;
}

export function sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
  return sendEmail({
    to,
    toName: name,
    subject: "Reset your Sarvpratham Analytics password",
    html: emailShell(
      "Reset your password",
      `
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 30 minutes.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #1a1a2e; color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `
    ),
  });
}
