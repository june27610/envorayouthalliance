
(function () {
  function loadGlobal() {
    // If global.js is already loaded, do nothing.
    if (window.__ENVORA_GLOBAL_LOADED__) return;
    
    // Check if script already exists
    if (document.querySelector('script[src="javascript/global.js"]')) {
      window.__ENVORA_GLOBAL_LOADED__ = true;
      return;
    }
    
    const s = document.createElement('script');
    s.src = 'javascript/global.js';
    s.async = false;
    document.body.appendChild(s);
    window.__ENVORA_GLOBAL_LOADED__ = true;
  }

  // Load immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGlobal);
  } else {
    loadGlobal();
  }
})();

