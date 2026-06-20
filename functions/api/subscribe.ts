import type { Env } from '../index';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleSubscribe(request: Request, env: Env): Promise<Response> {
  let email: string;

  try {
    const body = await request.json<{ email?: unknown }>();
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (!EMAIL_RE.test(email)) {
    return json({ error: 'Invalid email address' }, 400);
  }

  const token = crypto.randomUUID();

  try {
    await env.SUBSCRIBERS_DB
      .prepare('INSERT INTO subscribers (email, unsubscribe_token) VALUES (?, ?)')
      .bind(email, token)
      .run();
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
      return json({ error: 'Already subscribed' }, 409);
    }
    throw err;
  }

  await env.NOTIFICATIONS_QUEUE.send({ type: 'subscribe', email });

  return json({ message: 'Subscribed successfully' }, 201);
}
