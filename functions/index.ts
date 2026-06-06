import { handleSubscribe } from './api/subscribe';
import { handleNotify } from './api/notify';
import { handleNotifyNew } from './api/notify-new';
import { handleFeedback } from './api/feedback';
import { handleQueueBatch } from './queue-consumer';

export type NotificationMessage =
  | { type: 'feedback'; slug: string; reaction: 'up' | 'down'; comment?: string }
  | { type: 'subscribe'; email: string };

export interface Env {
  ASSETS: Fetcher;
  SUBSCRIBERS_DB: D1Database;
  RESEND_API_KEY: string;
  NOTIFY_TOKEN: string;
  NTFY_TOPIC: string;
  CF_ACCESS_CLIENT_ID: string;
  CF_ACCESS_CLIENT_SECRET: string;
  NOTIFICATIONS_QUEUE: Queue<NotificationMessage>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.headers.get('host')?.startsWith('www.')) {
      url.hostname = 'addy.se';
      return Response.redirect(url.toString(), 301);
    }


    if (url.pathname === '/api/subscribe' && request.method === 'POST') {
      return handleSubscribe(request, env);
    }

    if (url.pathname === '/api/notify' && request.method === 'POST') {
      return handleNotify(request, env);
    }

    if (url.pathname === '/api/notify-new' && request.method === 'POST') {
      return handleNotifyNew(request, env);
    }

    if (url.pathname === '/api/feedback' && request.method === 'POST') {
      return handleFeedback(request, env);
    }

    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await env.ASSETS.fetch(request);

    if (response.status === 404) {
      const notFoundPage = await env.ASSETS.fetch(
        new Request(new URL('/404/', request.url).toString())
      );
      return new Response(notFoundPage.body, {
        status: 404,
        headers: notFoundPage.headers,
      });
    }

    return response;
  },

  async queue(batch: MessageBatch<NotificationMessage>, env: Env): Promise<void> {
    return handleQueueBatch(batch, env);
  },
};
