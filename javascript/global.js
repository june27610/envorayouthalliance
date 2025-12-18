
(function () {
  function safeJsonParse(raw, fallback) {
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }

  function getCurrentUser() {
    return safeJsonParse(localStorage.getItem('envoraCurrentUser') || 'null', null);
  }

  function isSignedIn() {
    return localStorage.getItem('isSignedIn') === 'true' && !!getCurrentUser();
  }

  // Theme functions removed

  function logout() {
    localStorage.removeItem('isSignedIn');
    localStorage.removeItem('envoraCurrentUser');
  }

  function ensureGoToTop() {
    // Only add to pages with top navbar
    if (!document.querySelector('.navbar.fixed-top')) return;
    
    if (document.querySelector('.envora-top')) return;
    
    const btn = document.createElement('button');
    btn.className = 'envora-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Go to top');
    btn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    
    // Ensure body exists before appending
    if (document.body) {
      document.body.appendChild(btn);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(btn);
      });
    }

    const onScroll = () => {
      if (window.scrollY > 350) {
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  
  // Make function globally available
  window.ensureGoToTop = ensureGoToTop;

  function initRevealAnimations() {
    const els = Array.from(document.querySelectorAll('.reveal, .fade-in'));
    if (els.length === 0) return;

    // If IntersectionObserver isn't available, just show everything.
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach(el => io.observe(el));
  }

  function buildNavTools() {
    const navButtons = document.querySelector('.nav-buttons');
    const navCollapse = document.querySelector('.navbar .navbar-collapse');
    if (!navButtons || !navCollapse) {
      // Retry after a short delay if elements aren't ready (max 5 retries)
      if (!window.__navToolsRetries) window.__navToolsRetries = 0;
      if (window.__navToolsRetries < 5) {
        window.__navToolsRetries++;
        setTimeout(buildNavTools, 100);
      }
      return;
    }
    window.__navToolsRetries = 0;

    // Auth area (profile dropdown OR sign in/up) - no search or theme toggle
    // Just update the nav buttons directly

    function renderAuthArea() {
      const signed = isSignedIn();
      const user = getCurrentUser();

      if (!signed) {
        navButtons.innerHTML = `
          <a href="signin.html?mode=signin" class="btn btn-signin mb-2 mb-lg-0">Sign In</a>
          <a href="signin.html?mode=signup" class="btn btn-signup">Sign Up</a>
        `;
        return;
      }

      const username = (user && (user.username || user.fullname || user.email)) ? (user.username || user.fullname || user.email) : 'User';

      navButtons.innerHTML = `
        <div class="envora-profile">
          <button type="button" class="envora-icon-btn envora-profile-btn" id="envoraProfileBtn" aria-haspopup="menu" aria-expanded="false">
            <i class="bi bi-person-circle"></i>
            <span class="envora-profile-name">${escapeHtml(username)}</span>
            <i class="bi bi-caret-down-fill" style="font-size:.85rem;"></i>
          </button>
          <div class="envora-menu" id="envoraProfileMenu" role="menu" aria-label="Profile menu">
            <a href="workspace.html" role="menuitem"><i class="bi bi-grid-1x2"></i> Workspace</a>
            <a href="profile.html" role="menuitem"><i class="bi bi-person"></i> Profile</a>
            <div class="divider" role="separator"></div>
            <button type="button" class="danger" id="envoraMenuLogout" role="menuitem"><i class="bi bi-box-arrow-right"></i> Log out</button>
          </div>
        </div>
      `;

      const btn = document.getElementById('envoraProfileBtn');
      const menu = document.getElementById('envoraProfileMenu');
      if (!btn || !menu) return;
      
      const toggleMenu = (open) => {
        const willOpen = typeof open === 'boolean' ? open : !menu.classList.contains('open');
        menu.classList.toggle('open', willOpen);
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      };
      btn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
      document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
          toggleMenu(false);
        }
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });
      const logoutBtn = document.getElementById('envoraMenuLogout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm('Log out of ENVORA?')) {
            logout();
            window.location.href = 'index.html';
          }
        });
      }
    }

    renderAuthArea();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function init() {
    ensureGoToTop();
    initRevealAnimations();
    
    // Delay buildNavTools to ensure navbar is fully rendered
    setTimeout(() => {
      buildNavTools();
    }, 100);
  }

  // Run on both DOMContentLoaded and window load to ensure everything is ready
  function runInit() {
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInit);
  } else {
    runInit();
  }
  
  // Also run on window load as a fallback
  window.addEventListener('load', () => {
    setTimeout(() => {
      ensureGoToTop();
      buildNavTools();
    }, 200);
  });
})();


