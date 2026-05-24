import type { SearchEntry } from '../build/types';

let cachedIndex: SearchEntry[] | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let isOpen = false;

// Assigned in buildUI(), which runs before any user interaction is possible
let modal!: HTMLElement;
let input!: HTMLInputElement;
let results!: HTMLElement;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Wraps direct substring matches of query in <mark>.
 * Text is HTML-escaped before the RegExp runs so the pattern operates on
 * original characters, not entities. Subsequence-only matches get no <mark>.
 */
function highlight(text: string, query: string): string {
  const safe = escapeHtml(text);
  const safeQuery = escapeRegExp(query);
  if (!safeQuery) return safe;
  return safe.replace(new RegExp(safeQuery, 'gi'), '<mark>$&</mark>');
}

/**
 * Returns 0 if query chars don't appear in order in text, or 1–3 based on
 * match density (characters matched relative to span traversed).
 */
function subsequenceScore(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let ti = 0;
  let qi = 0;
  while (ti < t.length && qi < q.length) {
    if (t[ti] === q[qi]) qi++;
    ti++;
  }
  if (qi < q.length) return 0;
  return Math.min(3, Math.round(3 * q.length / ti));
}

function scoreEntry(entry: SearchEntry, query: string): number {
  const q = query.toLowerCase();
  const titleLower = entry.title.toLowerCase();
  const introLower = entry.intro.toLowerCase();

  let primary = 0;
  if (titleLower === q) primary += 10;
  else if (titleLower.includes(q)) primary += 6;
  if (entry.tags.some(t => t.toLowerCase().includes(q))) primary += 4;
  if (introLower.includes(q)) primary += 2;
  primary += subsequenceScore(entry.title, query);

  // Content match only surfaces when there is already a title/tag/intro signal
  const contentBonus = primary > 0 && entry.content.toLowerCase().includes(q) ? 1 : 0;
  return primary + contentBonus;
}

async function fetchIndex(): Promise<SearchEntry[]> {
  if (cachedIndex) return cachedIndex;
  const res = await fetch('/search-index.json');
  cachedIndex = await res.json() as SearchEntry[];
  return cachedIndex;
}

function renderResults(scored: Array<{ entry: SearchEntry; score: number }>, query: string): void {
  if (scored.length === 0) {
    results.innerHTML = '<p class="search-empty">No results</p>';
    return;
  }

  results.innerHTML = scored.map(({ entry }) => {
    return `<a href="/posts/${entry.slug}/" class="search-result">
      <div class="search-result-title">${highlight(entry.title, query)}</div>
      ${entry.intro ? `<div class="search-result-intro">${highlight(entry.intro, query)}</div>` : ''}
      <div class="search-result-meta">
        <span class="search-date">${escapeHtml(entry.date)}</span>
      </div>
    </a>`;
  }).join('');
}

async function runSearch(query: string): Promise<void> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    results.innerHTML = '';
    return;
  }
  try {
    const entries = await fetchIndex();
    const scored = entries
      .map(entry => ({ entry, score: scoreEntry(entry, trimmed) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
    renderResults(scored, trimmed);
  } catch (_err) {
    results.innerHTML = '<p class="search-empty">Search unavailable</p>';
  }
}

function openModal(): void {
  if (isOpen) return;
  isOpen = true;
  modal.removeAttribute('hidden');
  document.body.classList.add('search-open');
  input.focus();
}

function closeModal(): void {
  if (!isOpen) return;
  isOpen = false;
  modal.setAttribute('hidden', '');
  document.body.classList.remove('search-open');
  input.value = '';
  results.innerHTML = '';
}

function buildUI(): void {
  const root = document.getElementById('search-root');
  if (root) {
    const btn = document.createElement('button');
    btn.className = 'search-toggle';
    btn.setAttribute('aria-label', 'Search');
    btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
    btn.addEventListener('click', openModal);
    root.appendChild(btn);
  }

  modal = document.createElement('div');
  modal.className = 'search-modal';
  modal.setAttribute('hidden', '');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Search');

  const backdrop = document.createElement('div');
  backdrop.className = 'search-backdrop';
  backdrop.addEventListener('click', closeModal);

  const box = document.createElement('div');
  box.className = 'search-box';

  input = document.createElement('input');
  input.id = 'search-input';
  input.className = 'search-input';
  input.type = 'search';
  input.placeholder = 'Search articles… (⌘K)';
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('spellcheck', 'false');
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => void runSearch(input.value), 150);
  });

  results = document.createElement('div');
  results.className = 'search-results';
  results.setAttribute('role', 'list');

  box.append(input, results);
  modal.append(backdrop, box);
  document.body.appendChild(modal);
}

document.addEventListener('DOMContentLoaded', () => {
  buildUI();

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      isOpen ? closeModal() : openModal();
    }
    if (e.key === 'Escape' && isOpen) closeModal();
  });
});
