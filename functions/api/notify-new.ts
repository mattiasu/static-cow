import type { Env } from '../index';

interface SearchEntry {
  slug: string;
  title: string;
  intro: string;
  date: string;
  hero: string;
  firstParagraph: string;
}

interface NotifiedPost {
  slug: string;
}

interface Subscriber {
  email: string;
  unsubscribe_token: string | null;
}

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const FROM_ADDRESS = 'newsletter@addy.se';
const SITE_URL = 'https://addy.se';
const BATCH_SIZE = 100;

function buildEmailHtml(post: SearchEntry, unsubscribeToken: string): string {
  const postUrl = `${SITE_URL}/posts/${post.slug}/`;
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${unsubscribeToken}`;
  const heroImg = post.hero
    ? `<img src="${SITE_URL}/assets/images/${post.hero}" alt="${post.title}" style="width:100%;max-width:600px;height:auto;display:block;border-radius:4px;margin-bottom:24px;">`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111;">
  ${heroImg}
  <h1 style="font-size:22px;margin-bottom:6px;">${post.title}</h1>
  <p style="color:#888;font-size:13px;margin-bottom:20px;">${post.date}</p>
  <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">${post.intro}</p>
  ${post.firstParagraph ? `<p style="font-size:15px;line-height:1.6;color:#444;margin-bottom:24px;">${post.firstParagraph}</p>` : ''}
  <a href="${postUrl}" style="color:#2DC093;font-size:15px;">Read the full article →</a>
  <p style="margin-top:40px;font-size:12px;color:#999;text-align:center;">
    <a href="${unsubscribeUrl}" style="color:#999;text-decoration:none;">Unsubscribe</a>
  </p>
</body>
</html>`;
}

/**
 * POST /api/notify-new
 * Sends a newsletter for each post not yet recorded in notified_posts.
 * Safe to call repeatedly — already-notified slugs are skipped.
 * Protected by the same Bearer token as /api/notify.
 */
export async function handleNotifyNew(request: Request, env: Env): Promise<Response> {
  const auth = request.headers.get('Authorization');
  if (!auth || auth !== `Bearer ${env.NOTIFY_TOKEN}`) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // Fetch the search index from the deployed static assets
  const indexUrl = new URL('/search-index.json', request.url);
  const indexRes = await env.ASSETS.fetch(new Request(indexUrl.toString()));
  if (!indexRes.ok) {
    return json({ error: 'Could not fetch search index' }, 502);
  }
  const allPosts = await indexRes.json<SearchEntry[]>();

  // Determine which slugs have already been notified
  const { results: notified } = await env.SUBSCRIBERS_DB
    .prepare('SELECT slug FROM notified_posts')
    .all<NotifiedPost>();
  const notifiedSlugs = new Set(notified.map(r => r.slug));

  const newPosts = allPosts.filter(p => !notifiedSlugs.has(p.slug));

  if (newPosts.length === 0) {
    return json({ message: 'No new posts to notify', sent: 0 }, 200);
  }

  const { results: subscribers } = await env.SUBSCRIBERS_DB
    .prepare('SELECT email, unsubscribe_token FROM subscribers WHERE status = ?')
    .bind('active')
    .all<Subscriber>();

  // Record posts as notified even if there are no subscribers, so they don't pile up
  if (subscribers.length === 0) {
    for (const post of newPosts) {
      await env.SUBSCRIBERS_DB
        .prepare('INSERT OR IGNORE INTO notified_posts (slug) VALUES (?)')
        .bind(post.slug)
        .run();
    }
    return json({ message: 'No active subscribers', sent: 0 }, 200);
  }

  let totalSent = 0;

  for (const post of newPosts) {
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const chunk = subscribers.slice(i, i + BATCH_SIZE);
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          chunk.map(({ email, unsubscribe_token }) => ({
            from: FROM_ADDRESS,
            to: email,
            subject: post.title,
            html: buildEmailHtml(post, unsubscribe_token ?? ''),
          }))
        ),
      });

      if (!res.ok) {
        const detail = await res.text();
        return json({ error: `Resend API error for "${post.title}": ${detail}`, sent: totalSent }, 502);
      }

      totalSent += chunk.length;
    }

    await env.SUBSCRIBERS_DB
      .prepare('INSERT OR IGNORE INTO notified_posts (slug) VALUES (?)')
      .bind(post.slug)
      .run();
  }

  return json({ message: 'Sent', notified: newPosts.map(p => p.slug), sent: totalSent }, 200);
}
