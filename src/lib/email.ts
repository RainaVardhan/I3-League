import { Resend } from "resend";

// Email sending via Resend. Falls back to logging (never throws, never
// blocks a core flow) until RESEND_API_KEY / RESEND_FROM_EMAIL are set in
// .env — see the comments there. Once both are set, this actually sends;
// a real provider call CAN reject, so every caller still wraps this in its
// own try/catch rather than assuming delivery.
type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

let client: Resend | null = null;
function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

export async function sendEmail({ to, subject, text }: SendEmailInput): Promise<void> {
  const resend = getClient();
  const fromAddress = process.env.RESEND_FROM_EMAIL;

  if (!resend || !fromAddress) {
    console.log(`[email:stub, no RESEND_API_KEY/RESEND_FROM_EMAIL set] to=${to} subject="${subject}"\n${text}`);
    return;
  }

  // A bare address (RESEND_FROM_EMAIL) shows as its own local part
  // ("noreply") in an inbox's sender name — pair it with a real display
  // name so it reads as "I3 League" instead.
  const from = `I3 League <${fromAddress}>`;

  const { error } = await resend.emails.send({ from, to, subject, text });
  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}
