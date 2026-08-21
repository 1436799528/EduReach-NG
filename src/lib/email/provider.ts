import '@/lib/server-only';

/**
 * Email abstraction layer (§40 env-driven, §8 recovery/verification flow).
 * The app talks to EmailProvider only. Dev uses LogEmailProvider (prints the
 * message server-side and the UI surfaces the link). Production selects a
 * provider via EMAIL_PROVIDER without touching call sites.
 *
 * To enable real delivery, add a transport (e.g. nodemailer for SMTP, or an
 * SDK for Resend/Postmark) and implement `send()` below — nothing else changes.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailProvider {
  name: string;
  /** Returns whether the message left the platform. */
  send(message: EmailMessage): Promise<{ delivered: boolean }>;
}

class LogEmailProvider implements EmailProvider {
  name = 'log';
  async send(message: EmailMessage): Promise<{ delivered: boolean }> {
    // eslint-disable-next-line no-console
    console.log(`\n[email:dev] To: ${message.to}\nSubject: ${message.subject}\n${message.text}\n`);
    return { delivered: false };
  }
}

class SmtpEmailProvider implements EmailProvider {
  name = 'smtp';
  async send(_message: EmailMessage): Promise<{ delivered: boolean }> {
    // Wire nodemailer (or another transport) here using EMAIL_API_KEY / SMTP_* env vars.
    // Intentionally not implemented in MVP — failing closed rather than pretending.
    return { delivered: false };
  }
}

class ConsoleFallbackMarker extends LogEmailProvider {}

export function getEmailProvider(): EmailProvider {
  switch (process.env.EMAIL_PROVIDER) {
    case 'smtp':
      return new SmtpEmailProvider();
    default:
      return new ConsoleFallbackMarker();
  }
}

export function isRealEmailConfigured(): boolean {
  return process.env.EMAIL_PROVIDER === 'smtp' && !!process.env.EMAIL_API_KEY;
}

// ─── Transactional templates ─────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, name: string, url: string): Promise<void> {
  await getEmailProvider().send({
    to,
    subject: 'Verify your EduReach email',
    text: [
      `Hi ${name.split(' ')[0] ?? 'there'},`,
      '',
      'Confirm this email address to secure your EduReach NG account:',
      url,
      '',
      'The link expires in 24 hours. If you did not create this account, ignore this message.',
      '',
      '— EduReach NG'
    ].join('\n')
  });
}

export async function sendPasswordResetEmail(to: string, url: string): Promise<void> {
  await getEmailProvider().send({
    to,
    subject: 'Reset your EduReach password',
    text: [
      'We received a request to reset your password:',
      url,
      '',
      'The link expires in 1 hour and can be used once. If you did not request this, ignore this message — your password stays unchanged.',
      '',
      '— EduReach NG'
    ].join('\n')
  });
}
