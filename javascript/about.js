
document.addEventListener('DOMContentLoaded', () => {
  const counters = Array.from(document.querySelectorAll('[data-countup="true"][data-target]'));
  if (counters.length === 0) return;

  const animateCounter = (el) => {
    if (el.dataset.done === 'true') return;
    el.dataset.done = 'true';

    const target = Number(el.getAttribute('data-target') || '0') || 0;
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString();
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
  };

  // Use IntersectionObserver when possible
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    counters.forEach(el => io.observe(el));
  } else {
    counters.forEach(animateCounter);
  }
});


