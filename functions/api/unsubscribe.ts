import type { Env } from '../index';

function htmlResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function page(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | addy.se</title>
  <style>
    body { font-family: sans-serif; max-width: 480px; margin: 80px auto; padding: 24px; color: #333; }
    h1 { font-size: 22px; margin-bottom: 12px; }
    p { color: #555; line-height: 1.6; }
    a { color: #2DC093; text-decoration: none; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>${message}</p>
  <p><em>Stay safe &amp;</em> 👍</p>
  <p><a href="/">← Back to addy.se</a></p>
</body>
</html>`;
}

/**
 * GET /unsubscribe?token=<guid>
 * Marks the subscriber as unsubscribed. Safe to call multiple times.
 */
export async function handleUnsubscribe(request: Request, env: Env): Promise<Response> {
  const token = new URL(request.url).searchParams.get('token');

  if (!token) {
    return htmlResponse(
      page('Missing token', 'No unsubscribe token was provided. If you meant to unsubscribe, use the link in the email you received.'),
      400,
    );
  }

  const result = await env.SUBSCRIBERS_DB
    .prepare("UPDATE subscribers SET status = 'unsubscribed' WHERE unsubscribe_token = ? AND status = 'active'")
    .bind(token)
    .run();

  if (result.meta.changes === 0) {
    return htmlResponse(
      page('Already unsubscribed', 'This address is either already unsubscribed or the token is invalid.'),
      200,
    );
  }

  return htmlResponse(
    page('Unsubscribed', "Ah, sorry to see you go. That said, you've been removed from the list. No more emails from me."),
    200,
  );
}
