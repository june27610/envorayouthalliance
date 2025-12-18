document.addEventListener('DOMContentLoaded', () => {
  const coinsEl = document.getElementById('rewardCoins');
  const badgesEl = document.getElementById('rewardBadges');
  const grid = document.getElementById('rewardsGrid');
  const list = document.getElementById('redemptionList');
  const clearBtn = document.getElementById('clearRedemptions');

  const modalEl = document.getElementById('redeemModal');
  const redeemTitleEl = document.getElementById('redeemTitle');
  const redeemCostEl = document.getElementById('redeemCost');
  const confirmBtn = document.getElementById('confirmRedeemBtn');

  if (!grid || !coinsEl || !badgesEl) return;

  const REDEEM_KEY = 'envoraRedemptions';

  const rewards = [
    { id: 'water-bottle', title: 'Reusable Water Bottle', desc: 'A durable bottle to reduce single-use plastics.', costCoins: 150, costBadges: 0, icon: 'bi-droplet-fill' },
    { id: 'eco-bag', title: 'Eco Tote Bag', desc: 'Bring it to the park and markets — no plastic bags.', costCoins: 120, costBadges: 0, icon: 'bi-bag-fill' },
    { id: 'park-kit', title: 'Mini Park Clean-up Kit', desc: 'Gloves + trash bags + small grabber.', costCoins: 250, costBadges: 1, icon: 'bi-tools' },
    { id: 'event-pass', title: 'Priority Volunteer Spot', desc: 'Reserve a spot for the next community clean-up.', costCoins: 200, costBadges: 0, icon: 'bi-calendar-event-fill' },
    { id: 'certificate', title: 'Recognition Certificate', desc: 'A printable certificate for your contribution.', costCoins: 80, costBadges: 0, icon: 'bi-award-fill' },
    { id: 'mystery', title: 'Mystery Reward', desc: 'Coming soon — partner rewards outside the app.', costCoins: 300, costBadges: 2, icon: 'bi-gift-fill' },
  ];

  function getData() {
    try {
      return JSON.parse(localStorage.getItem('envoraGamification') || '{"coins":0,"badges":[],"completedQuizzes":[],"completedChallenges":[]}');
    } catch (e) {
      return { coins: 0, badges: [], completedQuizzes: [], completedChallenges: [] };
    }
  }

  function saveData(data) {
    localStorage.setItem('envoraGamification', JSON.stringify(data));
  }

  function loadRedemptions() {
    try { return JSON.parse(localStorage.getItem(REDEEM_KEY) || '[]'); } catch (e) { return []; }
  }

  function saveRedemptions(items) {
    localStorage.setItem(REDEEM_KEY, JSON.stringify(items));
  }

  function renderBalance() {
    const data = getData();
    coinsEl.textContent = (data.coins || 0).toLocaleString();
    badgesEl.textContent = (data.badges || []).length.toLocaleString();
  }

  function renderHistory() {
    if (!list) return;
    const items = loadRedemptions().slice().sort((a, b) => b.createdAt - a.createdAt);
    list.innerHTML = '';
    if (items.length === 0) {
      list.innerHTML = '<li class="muted">No redemptions yet.</li>';
      return;
    }
    items.slice(0, 20).forEach((r) => {
      const li = document.createElement('li');
      li.className = 'd-flex justify-content-between align-items-start gap-3 py-2';
      li.innerHTML = `
        <div>
          <div class="fw-semibold">${r.title}</div>
          <div class="muted" style="font-size:.92rem;">${new Date(r.createdAt).toLocaleString()}</div>
        </div>
        <div class="text-end muted" style="white-space:nowrap;">
          -${Number(r.costCoins || 0)} coins<br>
          -${Number(r.costBadges || 0)} badges
        </div>
      `;
      list.appendChild(li);
    });
  }

  function canRedeem(reward) {
    const data = getData();
    const coins = data.coins || 0;
    const badges = (data.badges || []).length;
    return coins >= reward.costCoins && badges >= reward.costBadges;
  }

  function renderRewards() {
    grid.innerHTML = '';
    rewards.forEach((r) => {
      const ok = canRedeem(r);
      const col = document.createElement('div');
      col.className = 'col-12 col-md-6';
      col.innerHTML = `
        <div class="p-3 rounded-4 border h-100" style="background: rgba(255,255,255,0.6);">
          <div class="d-flex justify-content-between align-items-start gap-3">
            <div class="d-flex gap-2 align-items-center">
              <div class="rounded-3 d-flex align-items-center justify-content-center" style="width:44px;height:44px;background: rgba(56,174,96,0.14);">
                <i class="bi ${r.icon}" style="color:#38ae60;font-size:1.2rem;"></i>
              </div>
              <div>
                <div class="fw-bold">${r.title}</div>
                <div class="muted">${r.desc}</div>
              </div>
            </div>
          </div>
          <hr class="my-3">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div class="muted">
              Cost: <strong>${r.costCoins}</strong> coins
              ${r.costBadges ? ` + <strong>${r.costBadges}</strong> badge(s)` : ''}
            </div>
            <button class="btn btn-sm ${ok ? 'btn-success' : 'btn-outline-secondary'}" ${ok ? '' : 'disabled'} data-reward-id="${r.id}">
              ${ok ? 'Redeem' : 'Not enough'}
            </button>
          </div>
        </div>
      `;
      grid.appendChild(col);
    });

    grid.querySelectorAll('button[data-reward-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-reward-id');
        const r = rewards.find(x => x.id === id);
        if (!r) return;
        openRedeemModal(r);
      });
    });
  }

  let pendingReward = null;
  function openRedeemModal(reward) {
    pendingReward = reward;
    redeemTitleEl.textContent = reward.title;
    redeemCostEl.textContent = `Cost: ${reward.costCoins} coins${reward.costBadges ? ` + ${reward.costBadges} badge(s)` : ''}`;
    if (modalEl && window.bootstrap?.Modal) {
      new bootstrap.Modal(modalEl).show();
    } else {
      if (confirm(`Redeem "${reward.title}" for ${reward.costCoins} coins?`)) doRedeem();
    }
  }

  function doRedeem() {
    const reward = pendingReward;
    if (!reward) return;
    if (!canRedeem(reward)) {
      alert('Not enough coins/badges to redeem this reward.');
      return;
    }
    const data = getData();
    data.coins = (data.coins || 0) - reward.costCoins;
    if (reward.costBadges) {
      data.badges = (data.badges || []).slice(0, Math.max(0, (data.badges || []).length - reward.costBadges));
    }
    saveData(data);

    const items = loadRedemptions();
    items.push({ id: Date.now(), rewardId: reward.id, title: reward.title, costCoins: reward.costCoins, costBadges: reward.costBadges, createdAt: Date.now() });
    saveRedemptions(items);

    renderBalance();
    renderRewards();
    renderHistory();
    alert('Redeemed! (Demo: saved locally.)');
  }

  confirmBtn?.addEventListener('click', () => {
    doRedeem();
    // hide modal
    try {
      const inst = bootstrap.Modal.getInstance(modalEl);
      inst?.hide();
    } catch (e) {}
  });

  clearBtn?.addEventListener('click', () => {
    if (!confirm('Clear redemption history on this browser?')) return;
    localStorage.removeItem(REDEEM_KEY);
    renderHistory();
  });

  renderBalance();
  renderRewards();
  renderHistory();
});



