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

    console.log(`[queue] topic="${env.NTFY_TOPIC}" key_prefix="${env.NTFY_API_KEY?.slice(0, 6)}..." title="${title}" tags="${tags}"`);
    const res = await fetch(`https://ntfy.sh/${env.NTFY_TOPIC}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.NTFY_API_KEY}`,
        'X-Title': title,
        'X-Tags': tags,
      },
      body,
    });
    console.log(`[queue] ntfy status=${res.status} body=${await res.text()}`);

    msg.ack();
  }
}
