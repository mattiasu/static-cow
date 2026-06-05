document.addEventListener('DOMContentLoaded', () => {
  const widget = document.getElementById('feedback-widget');
  if (!widget) return;

  const slug = widget.dataset.slug;
  if (!slug) return;

  const buttons = widget.querySelectorAll<HTMLButtonElement>('.feedback-btn');
  const form = widget.querySelector<HTMLElement>('.feedback-form');
  const textarea = widget.querySelector<HTMLTextAreaElement>('.feedback-textarea');
  const submitBtn = widget.querySelector<HTMLButtonElement>('.feedback-submit');
  const thankYou = widget.querySelector<HTMLElement>('.feedback-thanks');

  if (!form || !textarea || !submitBtn || !thankYou) return;

  let chosenReaction: 'up' | 'down' | null = null;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      chosenReaction = btn.dataset.reaction as 'up' | 'down';
      buttons.forEach(b => b.classList.toggle('feedback-btn--active', b === btn));
      form.hidden = false;
      textarea.focus();
    });
  });

  submitBtn.addEventListener('click', async () => {
    if (!chosenReaction) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, reaction: chosenReaction, comment: textarea.value.trim() || undefined }),
      });
    } catch (_) {
      // silently ignore network errors — feedback is best-effort
    }

    widget.innerHTML = '';
    widget.appendChild(thankYou);
    thankYou.hidden = false;
  });
});
