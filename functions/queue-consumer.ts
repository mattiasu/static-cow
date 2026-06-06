import type { Env, NotificationMessage } from './index';

export async function handleQueueBatch(
  batch: MessageBatch<NotificationMessage>,
  env: Env
): Promise<void> {
  for (const msg of batch.messages) {
    const { type } = msg.body;

    let title: string;
    let body: string;
    let tags: string;

    if (type === 'feedback') {
      const { slug, reaction, comment } = msg.body;
      const emoji = reaction === 'up' ? '👍' : '👎';
      title = 'New feedback';
      body = comment ? `${emoji} on "${slug}"\n\n${comment}` : `${emoji} on "${slug}"`;
      tags = reaction === 'up' ? '+1' : '-1';
    } else {
      title = 'New subscriber';
      body = msg.body.email;
      tags = 'email';
    }

    console.log(`[queue] sending notification type=${type} title="${title}" target=ntfy.sh/${env.NTFY_TOPIC}`);

    const res = await fetch(`https://defl.addy.se`, {
      method: 'POST',
      headers: {
        'CF-Access-Client-Id': env.CF_ACCESS_CLIENT_ID,
        'CF-Access-Client-Secret': env.CF_ACCESS_CLIENT_SECRET,
        'X-Target-Url': `https://ntfy.sh/${env.NTFY_TOPIC}`,
        'X-Title': title,
        'X-Tags': tags,
      },
      body,
    });

    console.log(`[queue] defl.addy.se responded status=${res.status}`);
    if (!res.ok) {
      const text = await res.text();
      console.error(`[queue] error response body: ${text}`);
    }

    msg.ack();
  }
}
