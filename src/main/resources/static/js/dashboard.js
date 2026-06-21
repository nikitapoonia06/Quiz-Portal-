/**
 * Dashboard & Gamification Engine (Local Storage Sync & Analytics Charts)
 */

const BADGES = {
  FIRST_FLIGHT: {
    id: 'first_flight',
    name: 'First Flight',
    description: 'Complete your first quiz',
    icon: '🚀',
    xpBonus: 50
  },
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Get 100% on any quiz',
    icon: '🎯',
    xpBonus: 100
  },
  SPEEDSTER: {
    id: 'speedster',
    name: 'Speedster',
    description: 'Complete a quiz in under 60 seconds',
    icon: '⚡',
    xpBonus: 150
  },
  STREAK_3: {
    id: 'streak_3',
    name: 'Daily Quizzer',
    description: 'Maintain a 3-day quiz streak',
    icon: '🔥',
    xpBonus: 200
  },
  POLYMATH: {
    id: 'polymath',
    name: 'Polymath',
    description: 'Complete quizzes in 3 different categories',
    icon: '🧠',
    xpBonus: 250
  }
};

export const Dashboard = {
  /**
   * Load dashboard data from Local Storage
   */
  getData() {
    const data = localStorage.getItem('quiz_portal_user_data');
    if (!data) {
      const initialData = {
        nickname: '',
        xp: 0,
        streak: 0,
        lastActiveDate: null,
        history: [],
        favorites: [],
        unlockedBadges: []
      };
      localStorage.setItem('quiz_portal_user_data', JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(data);
  },

  /**
   * Save user data to Local Storage
   */
  saveData(data) {
    localStorage.setItem('quiz_portal_user_data', JSON.stringify(data));
  },

  /**
   * Update nickname
   */
  setNickname(nickname) {
    const data = this.getData();
    data.nickname = nickname.trim();
    this.saveData(data);
  },

  /**
   * Save a newly completed quiz result locally and update XP, streaks, and badges
   */
  recordResult(quizResult, quizMeta) {
    const data = this.getData();
    
    // 1. Add to history
    const historyItem = {
      id: Date.now(),
      quizId: quizMeta.id,
      quizTitle: quizMeta.title,
      categoryName: quizMeta.categoryName,
      categoryId: quizMeta.categoryId,
      score: quizResult.score,
      totalQuestions: quizResult.totalQuestions,
      percentage: quizResult.percentage,
      timeTaken: quizResult.timeTaken,
      date: new Date().toISOString()
    };
    data.history.push(historyItem);

    // 2. Base XP Reward: 10 XP per correct answer + 20 XP completion bonus
    let earnedXp = (quizResult.score * 10) + 20;
    data.xp += earnedXp;

    // 3. Update Streak
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (data.lastActiveDate === yesterdayStr) {
      data.streak += 1;
    } else if (data.lastActiveDate !== todayStr) {
      data.streak = 1; // broken or new streak
    }
    data.lastActiveDate = todayStr;

    // 4. Check for achievements / badges
    const newBadges = [];
    
    // First Flight
    if (!data.unlockedBadges.includes('first_flight')) {
      data.unlockedBadges.push('first_flight');
      data.xp += BADGES.FIRST_FLIGHT.xpBonus;
      newBadges.push(BADGES.FIRST_FLIGHT);
    }

    // Perfect Score
    if (quizResult.percentage === 100.0 && !data.unlockedBadges.includes('perfect_score')) {
      data.unlockedBadges.push('perfect_score');
      data.xp += BADGES.PERFECT_SCORE.xpBonus;
      newBadges.push(BADGES.PERFECT_SCORE);
    }

    // Speedster (completed in under 60 seconds)
    if (quizResult.timeTaken < 60 && !data.unlockedBadges.includes('speedster')) {
      data.unlockedBadges.push('speedster');
      data.xp += BADGES.SPEEDSTER.xpBonus;
      newBadges.push(BADGES.SPEEDSTER);
    }

    // Streak 3 days
    if (data.streak >= 3 && !data.unlockedBadges.includes('streak_3')) {
      data.unlockedBadges.push('streak_3');
      data.xp += BADGES.STREAK_3.xpBonus;
      newBadges.push(BADGES.STREAK_3);
    }

    // Polymath (3 different categories)
    if (!data.unlockedBadges.includes('polymath')) {
      const distinctCategories = new Set(data.history.map(h => h.categoryId));
      if (distinctCategories.size >= 3) {
        data.unlockedBadges.push('polymath');
        data.xp += BADGES.POLYMATH.xpBonus;
        newBadges.push(BADGES.POLYMATH);
      }
    }

    this.saveData(data);
    return {
      earnedXp,
      streak: data.streak,
      newBadges
    };
  },

  /**
   * Calculate User Level based on XP
   * Formula: Level = floor( sqrt(XP / 100) ) + 1
   */
  calculateLevel(xp) {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  },

  /**
   * Calculate XP required for the next level
   */
  xpForNextLevel(level) {
    return Math.pow(level, 2) * 100;
  },

  /**
   * Render pie/bar charts in user dashboard
   */
  renderAnalytics(chartCanvasId, history) {
    if (!history || history.length === 0) return null;

    // Group history by category to find distribution and avg score
    const categoriesData = {};
    history.forEach(item => {
      const cat = item.categoryName || 'Other';
      if (!categoriesData[cat]) {
        categoriesData[cat] = { totalPercentage: 0, count: 0 };
      }
      categoriesData[cat].totalPercentage += item.percentage;
      categoriesData[cat].count += 1;
    });

    const labels = Object.keys(categoriesData);
    const avgScores = labels.map(label => {
      const cat = categoriesData[label];
      return Math.round(cat.totalPercentage / cat.count);
    });
    const quizCounts = labels.map(label => categoriesData[label].count);

    const ctx = document.getElementById(chartCanvasId).getContext('2d');
    
    // Destroy existing chart to avoid overlay bugs
    if (window.dashboardChart) {
      window.dashboardChart.destroy();
    }

    window.dashboardChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Quizzes Taken',
            data: quizCounts,
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Average Score (%)',
            data: avgScores,
            backgroundColor: 'rgba(6, 182, 212, 0.6)',
            borderColor: 'rgba(6, 182, 212, 1)',
            borderWidth: 1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#F8FAFC' : '#1E293B' }
          }
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Quizzes Count', color: '#64748B' },
            ticks: { stepSize: 1, color: '#64748B' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Average Score (%)', color: '#64748B' },
            min: 0,
            max: 100,
            grid: { drawOnChartArea: false },
            ticks: { color: '#64748B' }
          },
          x: {
            ticks: { color: '#64748B' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          }
        }
      }
    });
  },

  /**
   * Render result analysis pie chart (Correct vs Incorrect)
   */
  renderResultPieChart(canvasId, correctCount, wrongCount) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (window.resultPieChart) {
      window.resultPieChart.destroy();
    }

    window.resultPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Correct', 'Incorrect'],
        datasets: [{
          data: [correctCount, wrongCount],
          backgroundColor: ['#10B981', '#EF4444'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#F8FAFC' : '#1E293B',
              font: { family: 'Outfit', size: 12 }
            }
          }
        }
      }
    });
  },

  /**
   * Get list of all available badges and unlock state
   */
  getBadgesWithState() {
    const data = this.getData();
    return Object.values(BADGES).map(badge => ({
      ...badge,
      unlocked: data.unlockedBadges.includes(badge.id)
    }));
  }
};
