// Reviews: localStorage-backed reviews for About page
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reviewForm');
  const list = document.getElementById('reviewsList');
  const sortSel = document.getElementById('reviewSort');
  const clearBtn = document.getElementById('clearMyReviews');

  if (!form || !list) return;

  const KEY = 'envoraReviews';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function stars(n) {
    const full = Math.max(1, Math.min(5, Number(n) || 5));
    let out = '';
    for (let i = 1; i <= 5; i++) out += `<i class="bi ${i <= full ? 'bi-star-fill' : 'bi-star'}"></i>`;
    return out;
  }

  function sortItems(items) {
    const mode = sortSel?.value || 'newest';
    const arr = [...items];
    if (mode === 'highest') arr.sort((a, b) => (b.rating - a.rating) || (b.createdAt - a.createdAt));
    else if (mode === 'lowest') arr.sort((a, b) => (a.rating - b.rating) || (b.createdAt - a.createdAt));
    else arr.sort((a, b) => b.createdAt - a.createdAt);
    return arr;
  }

  function render() {
    const items = sortItems(load());
    list.innerHTML = '';

    if (items.length === 0) {
      list.innerHTML = `
        <div class="col-12">
          <div class="review-empty">
            No reviews yet. Be the first to share your experience.
          </div>
        </div>
      `;
      return;
    }

    items.slice(0, 30).forEach((r) => {
      const col = document.createElement('div');
      col.className = 'col-md-6';
      col.innerHTML = `
        <div class="review-card">
          <div class="review-stars mb-3">${stars(r.rating)}</div>
          <p class="review-text">"${escapeHtml(r.text)}"</p>
          <div class="review-author">
            <strong>${escapeHtml(r.name)}</strong>
            <span class="text-muted">${escapeHtml(r.role || 'Community Member')}</span>
          </div>
          <div class="review-meta">${new Date(r.createdAt).toLocaleString()}</div>
        </div>
      `;
      list.appendChild(col);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('reviewName')?.value?.trim();
    const role = document.getElementById('reviewRole')?.value?.trim();
    const rating = Number(document.getElementById('reviewRating')?.value || 5);
    const text = document.getElementById('reviewText')?.value?.trim();

    if (!name || !text) {
      alert('Please enter your name and review text.');
      return;
    }

    const item = {
      id: Date.now(),
      name,
      role: role || '',
      rating: Math.max(1, Math.min(5, rating)),
      text,
      createdAt: Date.now()
    };

    const items = load();
    items.push(item);
    save(items);
    form.reset();
    document.getElementById('reviewRating').value = '5';

    render();
    alert('Thanks! Your review was added.');
  });

  sortSel?.addEventListener('change', render);

  clearBtn?.addEventListener('click', () => {
    if (!confirm('Clear ALL saved reviews on this browser?')) return;
    localStorage.removeItem(KEY);
    render();
  });

  render();
});


