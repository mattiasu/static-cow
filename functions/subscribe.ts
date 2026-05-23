import type { Env } from './index';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: Record<string, string>, status: number): Response {
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

  const existing = await env.SUBSCRIBERS.get(email);
  if (existing !== null) {
    return json({ error: 'Already subscribed' }, 409);
  }

  await env.SUBSCRIBERS.put(email, new Date().toISOString());

  return json({ message: 'Subscribed successfully' }, 201);
}
