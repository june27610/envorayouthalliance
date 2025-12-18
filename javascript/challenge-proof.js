document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('proofForm');
  if (!form) return;

  const fileInput = document.getElementById('proofFile');
  const noteInput = document.getElementById('proofNote');
  const modalEl = document.getElementById('proofSubmittedModal');

  const challengeId =
    document.body?.getAttribute('data-challenge-id') ||
    window.CHALLENGE_ID ||
    'challenge';

  const KEY = 'envoraChallengeProofs';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const file = fileInput?.files?.[0] || null;
    const note = (noteInput?.value || '').trim();

    if (!file) {
      alert('Please upload a proof file (photo/video/pdf) before submitting.');
      return;
    }

    try {
      const items = load();
      items.push({
        id: Date.now(),
        challengeId,
        note,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        createdAt: new Date().toISOString()
      });
      save(items);
    } catch (err) {}

    // Reset and show modal
    form.reset();
    if (modalEl && window.bootstrap?.Modal) {
      const m = new bootstrap.Modal(modalEl);
      m.show();
    } else {
      alert('Proof submitted! (Saved locally in your browser for this demo.)');
    }
  });
});


