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

  const senderEmail = process.env.BREVO_SENDER_EMAIL || "Info@sarvprathamanalytics.com";
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

export function sendRegistrationOtpEmail(to: string, name: string, otp: string): Promise<void> {
  return sendEmail({
    to,
    toName: name,
    subject: `${otp} is your Sarvpratham Analytics verification code`,
    html: emailShell(
      "Verify your email",
      `
        <p>Hi ${name},</p>
        <p>Use the code below to verify your email and finish creating your account. This code expires in 10 minutes.</p>
        <p style="margin: 24px 0; text-align: center;">
          <span style="display: inline-block; background: #f1f1f4; color: #1a1a2e; padding: 14px 28px; border-radius: 12px; font-size: 28px; font-weight: bold; letter-spacing: 6px;">
            ${otp}
          </span>
        </p>
        <p>If you didn't try to create an account, you can safely ignore this email.</p>
      `
    ),
  });
}

export function sendLoginOtpEmail(to: string, name: string, otp: string): Promise<void> {
  return sendEmail({
    to,
    toName: name,
    subject: `${otp} is your Sarvpratham Analytics login code`,
    html: emailShell(
      "Your login code",
      `
        <p>Hi ${name},</p>
        <p>Use the code below to log in and access your courses. This code expires in 10 minutes.</p>
        <p style="margin: 24px 0; text-align: center;">
          <span style="display: inline-block; background: #f1f1f4; color: #1a1a2e; padding: 14px 28px; border-radius: 12px; font-size: 28px; font-weight: bold; letter-spacing: 6px;">
            ${otp}
          </span>
        </p>
        <p>If you didn't try to log in, you can safely ignore this email.</p>
      `
    ),
  });
}

export function sendActivationOtpEmail(to: string, name: string, otp: string): Promise<void> {
  return sendEmail({
    to,
    toName: name,
    subject: `${otp} is your Sarvpratham Analytics activation code`,
    html: emailShell(
      "Activate your account",
      `
        <p>Hi ${name},</p>
        <p>Use the code below to verify it's you and finish setting up a password for your account. This code expires in 10 minutes.</p>
        <p style="margin: 24px 0; text-align: center;">
          <span style="display: inline-block; background: #f1f1f4; color: #1a1a2e; padding: 14px 28px; border-radius: 12px; font-size: 28px; font-weight: bold; letter-spacing: 6px;">
            ${otp}
          </span>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `
    ),
  });
}

export function sendGuestPurchaseConfirmationEmail(
  to: string,
  name: string,
  courseTitle: string,
  amount: number,
  currency: string,
  orderId: string,
  activationUrl: string
): Promise<void> {
  return sendEmail({
    to,
    toName: name,
    subject: `Your purchase of ${courseTitle} is confirmed`,
    html: emailShell(
      "Purchase confirmed!",
      `
        <p>Hi ${name},</p>
        <p>Thank you for your purchase. Here are your order details:</p>
        <div style="margin: 20px 0; padding: 16px; background: #f8f8fa; border-radius: 12px;">
          <p style="margin: 0 0 6px;"><strong>Course:</strong> ${courseTitle}</p>
          <p style="margin: 0 0 6px;"><strong>Amount Paid:</strong> ${currency} ${amount}</p>
          <p style="margin: 0;"><strong>Order ID:</strong> ${orderId}</p>
        </div>
        <p>Your course is already unlocked and waiting for you — no login required right now.</p>
        <p>To access your course again later, save your account by setting a password:</p>
        <p style="margin: 24px 0;">
          <a href="${activationUrl}" style="background: #1a1a2e; color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold; display: inline-block;">
            Activate My Account
          </a>
        </p>
      `
    ),
  });
}

export function sendActivationLinkEmail(to: string, name: string, activationUrl: string): Promise<void> {
  return sendEmail({
    to,
    toName: name,
    subject: "Activate your Sarvpratham Analytics account",
    html: emailShell(
      "Activate your account",
      `
        <p>Hi ${name},</p>
        <p>Here's your account activation link. Click below to set a password and log in anytime to access your purchased course(s).</p>
        <p style="margin: 24px 0;">
          <a href="${activationUrl}" style="background: #1a1a2e; color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold; display: inline-block;">
            Activate My Account
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `
    ),
  });
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
