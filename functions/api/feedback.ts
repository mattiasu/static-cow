import type { Env } from '../index';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_COMMENT_LENGTH = 1000;

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleFeedback(request: Request, env: Env): Promise<Response> {
  let slug: string;
  let reaction: string;
  let comment: string | undefined;

  try {
    const body = await request.json<{ slug?: unknown; reaction?: unknown; comment?: unknown }>();
    slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    reaction = typeof body.reaction === 'string' ? body.reaction.trim() : '';
    comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, MAX_COMMENT_LENGTH) : undefined;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (!SLUG_RE.test(slug)) {
    return json({ error: 'Invalid slug' }, 400);
  }

  if (reaction !== 'up' && reaction !== 'down') {
    return json({ error: 'Invalid reaction' }, 400);
  }

  await env.SUBSCRIBERS_DB
    .prepare('INSERT INTO feedback (slug, reaction, comment) VALUES (?, ?, ?)')
    .bind(slug, reaction, comment ?? null)
    .run();

  await env.NOTIFICATIONS_QUEUE.send({ type: 'feedback', slug, reaction: reaction as 'up' | 'down', comment });

  return json({ message: 'Feedback received' }, 201);
}
