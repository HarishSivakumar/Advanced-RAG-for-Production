import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactNotification({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const notificationEmail = process.env.NOTIFICATION_EMAIL || 'harish@example.com';

  try {
    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: notificationEmail,
      subject: `New Portfolio Contact: ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563EB; margin-bottom: 24px;">New Contact Form Submission</h2>
          <div style="background: #F8FAFC; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 8px;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0;"><strong>Message:</strong></p>
            <p style="margin: 8px 0 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #6B7280; font-size: 14px;">Sent from your portfolio contact form.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
