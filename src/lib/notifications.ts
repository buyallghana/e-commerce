import { createAdminClient } from '@/lib/supabase/admin';
import { NotificationType } from '@/types/database';

export async function createInAppNotification({
  userId,
  title,
  message,
  type = 'order',
  linkUrl,
}: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  linkUrl?: string;
}) {
  try {
    const supabase = createAdminClient();
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      link_url: linkUrl || null,
    });
  } catch (err) {
    console.error('Failed to create in-app notification:', err);
  }
}

export async function sendEmailNotification({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'BuyAll Ghana <orders@buyallghana.com>';

  if (!apiKey) {
    console.log(`[Email Notification Log (Resend API Key Pending)] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (err) {
    console.error('Failed to send transactional email:', err);
    return { success: false, error: err };
  }
}
