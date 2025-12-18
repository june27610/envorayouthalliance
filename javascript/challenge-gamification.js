const CHALLENGE_GAMIFICATION = {
  getData: function() {
    try {
      return JSON.parse(localStorage.getItem('envoraGamification') || '{"coins":0,"badges":[],"completedQuizzes":[],"completedChallenges":[]}');
    } catch(e) {
      return {coins: 0, badges: [], completedQuizzes: [], completedChallenges: []};
    }
  },
  saveData: function(data) {
    localStorage.setItem('envoraGamification', JSON.stringify(data));
  },
  addCoins: function(amount) {
    const data = this.getData();
    data.coins = (data.coins || 0) + amount;
    this.saveData(data);
    return data.coins;
  },
  addBadge: function(badgeId) {
    const data = this.getData();
    if (!data.badges) data.badges = [];
    if (!data.badges.includes(badgeId)) {
      data.badges.push(badgeId);
      this.saveData(data);
      return true;
    }
    return false;
  },
  completeChallenge: function(challengeId) {
    const data = this.getData();
    if (!data.completedChallenges) data.completedChallenges = [];
    if (!data.completedChallenges.includes(challengeId)) {
      data.completedChallenges.push(challengeId);
      this.saveData(data);
      return true;
    }
    return false;
  },
  updateCoinDisplay: function() {
    const data = this.getData();
    const coinEl = document.getElementById('coins');
    if (coinEl) {
      coinEl.textContent = data.coins || 0;
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CHALLENGE_GAMIFICATION.updateCoinDisplay());
} else {
  CHALLENGE_GAMIFICATION.updateCoinDisplay();
}
