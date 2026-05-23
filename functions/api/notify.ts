import type { Env } from '../index';

interface Subscriber {
  email: string;
}

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const FROM_ADDRESS = 'newsletter@addy.se';
const BATCH_SIZE = 100;

/**
 * POST /api/notify
 * Sends a newsletter to all active subscribers via Resend.
 * Protected by a Bearer token matched against env.NOTIFY_TOKEN.
 * Batches in groups of 100 to respect Resend's batch API limit.
 */
export async function handleNotify(request: Request, env: Env): Promise<Response> {
  const auth = request.headers.get('Authorization');
  if (!auth || auth !== `Bearer ${env.NOTIFY_TOKEN}`) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let subject: string;
  let html: string;

  try {
    const body = await request.json<{ subject?: unknown; html?: unknown }>();
    subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    html = typeof body.html === 'string' ? body.html.trim() : '';
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (!subject || !html) {
    return json({ error: 'subject and html are required' }, 400);
  }

  const { results: subscribers } = await env.SUBSCRIBERS_DB
    .prepare('SELECT email FROM subscribers WHERE status = ?')
    .bind('active')
    .all<Subscriber>();

  if (subscribers.length === 0) {
    return json({ message: 'No active subscribers', sent: 0 }, 200);
  }

  let sent = 0;
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const chunk = subscribers.slice(i, i + BATCH_SIZE);

    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        chunk.map(({ email }) => ({ from: FROM_ADDRESS, to: email, subject, html }))
      ),
    });

    if (!res.ok) {
      const detail = await res.text();
      return json({ error: `Resend API error: ${detail}`, sent }, 502);
    }

    sent += chunk.length;
  }

  return json({ message: 'Sent', sent }, 200);
}
