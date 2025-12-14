// Gamification system
const GAMIFICATION = {
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
  completeQuiz: function(quizId) {
    const data = this.getData();
    if (!data.completedQuizzes) data.completedQuizzes = [];
    if (!data.completedQuizzes.includes(quizId)) {
      data.completedQuizzes.push(quizId);
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
  }
};

// Quiz system
let currentQuiz = {
  i: 0,
  score: 0,
  questions: [],
  quizId: '',
  quizTitle: '',
  quizLevel: '',
  answers: []
};

function load(qs, quizId, quizTitle, quizLevel) {
  // Only reset if starting a new quiz (different quizId)
  if (currentQuiz.quizId !== quizId) {
    currentQuiz.i = 0;
    currentQuiz.score = 0;
    currentQuiz.answers = [];
  }
  
  currentQuiz.questions = qs;
  currentQuiz.quizId = quizId;
  currentQuiz.quizTitle = quizTitle;
  currentQuiz.quizLevel = quizLevel;
  
  if (qs.length === 0) return;
  
  const q = qs[currentQuiz.i];
  if (!q) return;
  
  document.getElementById("q").innerText = q.q;
  document.getElementById("opts").innerHTML = "";

  q.o.forEach((t, n) => {
    let b = document.createElement("button");
    b.className = "quiz-option";
    b.innerText = t;
    b.onclick = () => check(b, n, q.a, qs);
    document.getElementById("opts").appendChild(b);
  });

  updateProgress();
  document.getElementById("next").style.display = "none";
}

function check(btn, n, a, qs) {
  document.querySelectorAll("#opts button").forEach(b => b.disabled = true);
  const isCorrect = n === a;
  
  if (isCorrect) {
    btn.classList.add("correct");
    currentQuiz.score++;
  } else {
    btn.classList.add("wrong");
    // Highlight correct answer
    document.querySelectorAll("#opts button")[a].classList.add("correct");
  }
  
  // Store answer
  currentQuiz.answers.push({
    question: qs[currentQuiz.i].q,
    selected: n,
    correct: a,
    isCorrect: isCorrect
  });
  
  document.getElementById("next").style.display = "block";
}

function next(qs) {
  currentQuiz.i++;
  document.getElementById("next").style.display = "none";
  
  if (currentQuiz.i < qs.length) {
    load(qs, currentQuiz.quizId, currentQuiz.quizTitle, currentQuiz.quizLevel);
  } else {
    showResults();
  }
}

function updateProgress() {
  const progress = ((currentQuiz.i + 1) / currentQuiz.questions.length) * 100;
  document.querySelector(".bar").style.width = progress + "%";
}

function showResults() {
  const quizContainer = document.querySelector('.quiz');
  const totalQuestions = currentQuiz.questions.length;
  const percentage = Math.round((currentQuiz.score / totalQuestions) * 100);
  
  // Calculate rewards
  let coinsEarned = 0;
  let badgeEarned = null;
  
  if (percentage >= 80) {
    coinsEarned = 50;
    badgeEarned = currentQuiz.quizId + '_master';
  } else if (percentage >= 60) {
    coinsEarned = 30;
  } else {
    coinsEarned = 10;
  }
  
  // Add coins
  const newTotal = GAMIFICATION.addCoins(coinsEarned);
  
  // Check if quiz was completed for first time
  const isFirstCompletion = GAMIFICATION.completeQuiz(currentQuiz.quizId);
  if (isFirstCompletion && badgeEarned) {
    GAMIFICATION.addBadge(badgeEarned);
  }
  
  // Create results HTML
  quizContainer.innerHTML = `
    <div class="quiz-results">
      <div class="results-header">
        <h2>Quiz Complete!</h2>
        <div class="score-circle">
          <div class="score-value">${currentQuiz.score}/${totalQuestions}</div>
          <div class="score-percentage">${percentage}%</div>
        </div>
      </div>
      
      <div class="results-details">
        <div class="result-stat">
          <i class="bi bi-check-circle-fill"></i>
          <span>Correct Answers: <strong>${currentQuiz.score}</strong></span>
        </div>
        <div class="result-stat">
          <i class="bi bi-x-circle-fill"></i>
          <span>Incorrect: <strong>${totalQuestions - currentQuiz.score}</strong></span>
        </div>
        <div class="result-stat coins-earned">
          <i class="bi bi-coin"></i>
          <span>Coins Earned: <strong>+${coinsEarned}</strong></span>
        </div>
        <div class="result-stat">
          <i class="bi bi-piggy-bank-fill"></i>
          <span>Total Coins: <strong>${newTotal}</strong></span>
        </div>
        ${badgeEarned && isFirstCompletion ? `
        <div class="result-stat badge-earned">
          <i class="bi bi-patch-check-fill"></i>
          <span>Badge Unlocked: <strong>${currentQuiz.quizTitle} Master!</strong></span>
        </div>
        ` : ''}
      </div>
      
      <div class="results-actions">
        <a href="quizhome.html" class="btn btn-primary">Back to Quizzes</a>
        <button onclick="location.reload()" class="btn btn-secondary">Retake Quiz</button>
      </div>
    </div>
  `;
  
  // Add results styles if not already present
  if (!document.getElementById('quiz-results-styles')) {
    const style = document.createElement('style');
    style.id = 'quiz-results-styles';
    style.textContent = `
      .quiz-results {
        text-align: center;
        padding: 2rem;
      }
      .results-header h2 {
        margin-bottom: 1.5rem;
        color: var(--muted-text, #112022);
      }
      .score-circle {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: linear-gradient(135deg, #38ae60, #F98513);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto 2rem;
        color: white;
        box-shadow: 0 10px 30px rgba(56, 174, 96, 0.3);
      }
      .score-value {
        font-size: 2rem;
        font-weight: 700;
      }
      .score-percentage {
        font-size: 1rem;
        opacity: 0.9;
      }
      .results-details {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
        text-align: left;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
      }
      .result-stat {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: rgba(244, 241, 236, 0.5);
        border-radius: 10px;
      }
      .result-stat i {
        font-size: 1.5rem;
        color: var(--accent-green, #38ae60);
      }
      .result-stat.coins-earned i {
        color: #F98513;
      }
      .result-stat.badge-earned {
        background: linear-gradient(135deg, rgba(56, 174, 96, 0.1), rgba(249, 133, 19, 0.1));
        border: 2px solid var(--accent-green, #38ae60);
      }
      .result-stat.badge-earned i {
        color: var(--accent-orange, #F98513);
      }
      .results-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      .results-actions .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
        transition: transform 0.2s;
      }
      .results-actions .btn:hover {
        transform: translateY(-2px);
      }
      .results-actions .btn-primary {
        background: var(--accent-green, #38ae60);
        color: white;
        border: none;
      }
      .results-actions .btn-secondary {
        background: rgba(17, 32, 34, 0.1);
        color: var(--muted-text, #112022);
        border: 1px solid rgba(17, 32, 34, 0.2);
      }
      @media (max-width: 768px) {
        .quiz-results {
          padding: 1.5rem;
        }
        .score-circle {
          width: 120px;
          height: 120px;
        }
        .score-value {
          font-size: 1.5rem;
        }
        .score-percentage {
          font-size: 0.9rem;
        }
        .results-details {
          max-width: 100%;
        }
        .result-stat {
          padding: 0.6rem;
          font-size: 0.9rem;
        }
        .result-stat i {
          font-size: 1.25rem;
        }
        .results-actions {
          flex-direction: column;
        }
        .results-actions .btn {
          width: 100%;
        }
      }
      @media (max-width: 480px) {
        .quiz-results {
          padding: 1rem;
        }
        .score-circle {
          width: 100px;
          height: 100px;
        }
        .score-value {
          font-size: 1.25rem;
        }
        .results-header h2 {
          font-size: 1.25rem;
        }
        .result-stat {
          padding: 0.5rem;
          font-size: 0.85rem;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
