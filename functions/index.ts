import { handleSubscribe } from './api/subscribe';
import { handleNotify } from './api/notify';
import { handleNotifyNew } from './api/notify-new';

export interface Env {
  ASSETS: Fetcher;
  SUBSCRIBERS_DB: D1Database;
  RESEND_API_KEY: string;
  NOTIFY_TOKEN: string;
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

    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
