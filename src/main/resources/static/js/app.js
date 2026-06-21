/**
 * Core Application Controller (SPA Router, State, Quiz Engine & Keyboard Shortcuts)
 */

import { Api } from './api.js';
import { Dashboard } from './dashboard.js';

// Global Application State
const state = {
  activeView: 'landing',
  categories: [],
  quizzes: [],
  selectedCategory: null,
  selectedDifficulty: '',
  searchQuery: '',
  // Active Quiz State
  currentQuiz: null,
  currentQuizMeta: null,
  currentQuestionIndex: 0,
  userAnswers: {}, // key: questionId, value: { selectedOptionIds: [], textAnswer: '' }
  flaggedQuestions: new Set(),
  timeRemaining: 0,
  timerInterval: null,
  isFullscreen: false,
  totalTime: 0
};

// Initialize the Application
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  setupEventListeners();
  await loadLandingData();
  
  // Show landing by default
  router('landing');
});

// --- Theme Management ---
function initTheme() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
  
  // Re-render dashboard chart if active to fix label colors
  if (state.activeView === 'dashboard') {
    const data = Dashboard.getData();
    Dashboard.renderAnalytics('dashboard-chart', data.history);
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (theme === 'dark') {
    icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`;
  } else {
    icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;
  }
}

// --- Routing System (SPA View Toggler) ---
export function router(viewId, params = {}) {
  // Clean up timer if leaving a quiz view
  if (state.activeView === 'quiz' && viewId !== 'quiz') {
    clearInterval(state.timerInterval);
    if (state.isFullscreen) {
      exitFullscreen();
    }
  }

  // Deactivate old view
  const oldView = document.getElementById(`${state.activeView}-view`);
  if (oldView) oldView.classList.remove('active');

  // Activate new view
  const newView = document.getElementById(`${viewId}-view`);
  if (newView) {
    newView.classList.add('active');
    state.activeView = viewId;
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // View-specific initializers
  switch (viewId) {
    case 'landing':
      loadLandingData();
      break;
    case 'quizzes':
      renderQuizzesDirectory();
      break;
    case 'dashboard':
      renderUserDashboard();
      break;
    case 'leaderboard':
      loadLeaderboardData();
      break;
    case 'quiz-detail':
      loadQuizDetails(params.quizId);
      break;
  }
  
  updateNavigationUI(viewId);
}

function updateNavigationUI(viewId) {
  // Highlight active link in sidebar/navbar
  document.querySelectorAll('[data-nav]').forEach(el => {
    if (el.getAttribute('data-nav') === viewId) {
      el.classList.add('text-indigo-600', 'dark:text-indigo-400');
    } else {
      el.classList.remove('text-indigo-600', 'dark:text-indigo-400');
    }
  });
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Navigations
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      router(el.getAttribute('data-nav'));
    });
  });

  // Search & Filters in directory
  document.getElementById('search-input')?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderQuizzesDirectory();
  });

  document.getElementById('difficulty-filter')?.addEventListener('change', (e) => {
    state.selectedDifficulty = e.target.value;
    renderQuizzesDirectory();
  });

  // Quiz navigation buttons
  document.getElementById('prev-question-btn').addEventListener('click', previousQuestion);
  document.getElementById('next-question-btn').addEventListener('click', nextQuestion);
  document.getElementById('flag-question-btn').addEventListener('click', toggleFlagQuestion);
  document.getElementById('submit-quiz-btn').addEventListener('click', () => confirmSubmitQuiz());
  document.getElementById('fullscreen-toggle').addEventListener('click', toggleFullscreen);

  // Dashboard Nickname Form
  document.getElementById('save-nickname-btn').addEventListener('click', () => {
    const input = document.getElementById('dashboard-nickname-input');
    Dashboard.setNickname(input.value);
    showToast('Profile updated!', 'success');
    renderUserDashboard();
  });

  // Keyboard Shortcuts Listener for Quiz View
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

// --- Landing Page Loader ---
async function loadLandingData() {
  try {
    state.categories = await Api.fetchCategories();
    state.quizzes = await Api.fetchQuizzes();

    // Render stats
    document.getElementById('total-quizzes-stat').innerText = state.quizzes.length;
    document.getElementById('total-categories-stat').innerText = state.categories.length;

    // Render Categories
    const categoriesContainer = document.getElementById('categories-grid');
    categoriesContainer.innerHTML = '';
    
    state.categories.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'glass-card p-6 flex flex-col justify-between cursor-pointer';
      card.innerHTML = `
        <div>
          <div class="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-2xl text-indigo-600 dark:text-indigo-400 mb-4">
            ${getCategoryIcon(cat.name)}
          </div>
          <h3 class="font-bold text-lg mb-2">${cat.name}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">${cat.description}</p>
        </div>
        <div class="mt-6 flex justify-between items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          <span>Explore Quizzes</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      `;
      card.addEventListener('click', () => {
        state.selectedCategory = cat.id;
        router('quizzes');
        const filterSelect = document.getElementById('category-filter');
        if (filterSelect) filterSelect.value = cat.id;
      });
      categoriesContainer.appendChild(card);
    });

    // Render Popular / Featured Quizzes
    const popularContainer = document.getElementById('popular-quizzes-grid');
    popularContainer.innerHTML = '';
    
    // Take first 3 quizzes as featured
    state.quizzes.slice(0, 3).forEach(quiz => {
      const card = document.createElement('div');
      card.className = 'glass-card p-6 flex flex-col justify-between';
      card.innerHTML = `
        <div>
          <div class="flex justify-between items-start mb-4">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${getDifficultyBadgeClass(quiz.difficulty)}">
              ${quiz.difficulty}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ${quiz.duration} min
            </span>
          </div>
          <h3 class="font-bold text-lg mb-2">${quiz.title}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">${quiz.description}</p>
          <div class="text-xs text-slate-400 dark:text-slate-500 mb-2">Category: <span class="font-medium text-slate-600 dark:text-slate-300">${quiz.categoryName}</span></div>
        </div>
        <button class="w-full mt-4 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex justify-center items-center">
          View Details
        </button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        router('quiz-detail', { quizId: quiz.id });
      });
      popularContainer.appendChild(card);
    });

  } catch (error) {
    showToast('Failed to load page data', 'error');
  }
}

// --- Quizzes Directory Renderer ---
async function renderQuizzesDirectory() {
  try {
    // Fill category filter select once
    const filterSelect = document.getElementById('category-filter');
    if (filterSelect && filterSelect.options.length <= 1) {
      filterSelect.innerHTML = '<option value="">All Categories</option>';
      state.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.text = cat.name;
        filterSelect.appendChild(opt);
      });
      
      // Hook change listener
      filterSelect.addEventListener('change', (e) => {
        state.selectedCategory = e.target.value ? parseInt(e.target.value) : null;
        renderQuizzesDirectory();
      });
    }

    const quizzes = await Api.fetchQuizzes(state.selectedCategory, state.selectedDifficulty, state.searchQuery);
    const directoryGrid = document.getElementById('quizzes-directory-grid');
    directoryGrid.innerHTML = '';

    if (quizzes.length === 0) {
      directoryGrid.innerHTML = `
        <div class="col-span-full py-12 text-center">
          <p class="text-slate-500 dark:text-slate-400 text-lg">No quizzes found matching the filters.</p>
        </div>
      `;
      return;
    }

    quizzes.forEach(quiz => {
      const card = document.createElement('div');
      card.className = 'glass-card p-6 flex flex-col justify-between';
      card.innerHTML = `
        <div>
          <div class="flex justify-between items-start mb-4">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${getDifficultyBadgeClass(quiz.difficulty)}">
              ${quiz.difficulty}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ${quiz.duration} min
            </span>
          </div>
          <h3 class="font-bold text-lg mb-2">${quiz.title}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">${quiz.description}</p>
          <div class="text-xs text-slate-400 dark:text-slate-500 mb-2">Category: <span class="font-medium text-slate-600 dark:text-slate-300">${quiz.categoryName}</span></div>
          <div class="text-xs text-slate-400 dark:text-slate-500 mb-4">Questions: <span class="font-medium text-slate-600 dark:text-slate-300">${quiz.questionCount}</span></div>
        </div>
        <button class="w-full mt-4 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
          View Details
        </button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        router('quiz-detail', { quizId: quiz.id });
      });
      directoryGrid.appendChild(card);
    });
  } catch (error) {
    showToast('Failed to load quizzes directory', 'error');
  }
}

// --- Quiz Detail Page Loader ---
async function loadQuizDetails(quizId) {
  try {
    const quiz = await Api.fetchQuizById(quizId);
    
    document.getElementById('quiz-detail-title').innerText = quiz.title;
    document.getElementById('quiz-detail-desc').innerText = quiz.description;
    document.getElementById('quiz-detail-category').innerText = quiz.categoryName;
    document.getElementById('quiz-detail-duration').innerText = `${quiz.duration} Minutes`;
    document.getElementById('quiz-detail-questions').innerText = `${quiz.questionCount} Questions`;
    
    const difficultyBadge = document.getElementById('quiz-detail-difficulty');
    difficultyBadge.innerText = quiz.difficulty;
    difficultyBadge.className = `px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyBadgeClass(quiz.difficulty)}`;

    // Set up Start button
    const startBtn = document.getElementById('quiz-start-action-btn');
    startBtn.onclick = () => verifyNicknameAndStart(quizId);

    // Fetch quiz leaderboard
    const leaderboard = await Api.fetchQuizLeaderboard(quizId);
    const leaderboardList = document.getElementById('quiz-leaderboard-list');
    leaderboardList.innerHTML = '';

    if (leaderboard.length === 0) {
      leaderboardList.innerHTML = `
        <li class="py-4 text-center text-slate-500 dark:text-slate-400 text-sm">No scores submitted yet. Be the first!</li>
      `;
    } else {
      leaderboard.forEach((entry, idx) => {
        const item = document.createElement('li');
        item.className = 'py-3 flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50';
        item.innerHTML = `
          <div class="flex items-center space-x-3">
            <span class="font-bold text-sm text-slate-500 w-6">${idx + 1}.</span>
            <span class="font-semibold text-slate-700 dark:text-slate-300 text-sm">${entry.username}</span>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-xs text-slate-400">${entry.completionTime}s</span>
            <span class="font-bold text-indigo-600 dark:text-indigo-400 text-sm">${entry.percentage}%</span>
          </div>
        `;
        leaderboardList.appendChild(item);
      });
    }

  } catch (error) {
    showToast('Failed to load quiz details', 'error');
  }
}

// --- Leaderboard View ---
async function loadLeaderboardData() {
  try {
    const globalBoard = await Api.fetchGlobalLeaderboard();
    const podiumEl = document.getElementById('global-leaderboard-podium');
    const tableBody = document.getElementById('global-leaderboard-body');
    
    podiumEl.innerHTML = '';
    tableBody.innerHTML = '';

    if (globalBoard.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="py-8 text-center text-slate-500 dark:text-slate-400">No leaderboard entries found. Complete a quiz to get listed!</td>
        </tr>
      `;
      return;
    }

    // Split out podium (top 3)
    const podiumEntries = globalBoard.slice(0, 3);
    const tableEntries = globalBoard.slice(3);

    // Render Podium
    const orders = [1, 0, 2]; // Render 2nd place left, 1st center, 3rd right
    const ranks = ['2nd', '1st', '3rd'];
    const podiumStyles = [
      { height: 'h-36', order: 'order-1', color: 'bg-slate-300/80 dark:bg-slate-700/80', badge: '🥈' },
      { height: 'h-44', order: 'order-2', color: 'bg-amber-400/80 dark:bg-amber-500/80', badge: '🥇' },
      { height: 'h-28', order: 'order-3', color: 'bg-amber-600/80 dark:bg-amber-700/80', badge: '🥉' }
    ];

    orders.forEach(idx => {
      const entry = podiumEntries[idx];
      if (!entry) return;
      
      const podiumCard = document.createElement('div');
      podiumCard.className = `flex flex-col items-center justify-end flex-1 ${podiumStyles[idx].order}`;
      podiumCard.innerHTML = `
        <div class="text-3xl mb-2">${podiumStyles[idx].badge}</div>
        <div class="font-bold text-sm text-center line-clamp-1 w-20">${entry.username}</div>
        <div class="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate max-w-24">${entry.quizTitle}</div>
        <div class="${podiumStyles[idx].height} ${podiumStyles[idx].color} w-full rounded-t-lg flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105">
          <span class="font-extrabold text-slate-900 text-lg">${entry.percentage}%</span>
          <span class="text-xs text-slate-800 dark:text-slate-200 mt-1">${entry.completionTime}s</span>
        </div>
      `;
      podiumEl.appendChild(podiumCard);
    });

    // Render remaining table entries
    globalBoard.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-100/30 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-200/50 dark:border-slate-800/50';
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold">${index + 1}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-200">${entry.username}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">${entry.quizTitle}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">${entry.completionTime}s</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 dark:text-indigo-400">${entry.percentage}%</td>
      `;
      tableBody.appendChild(row);
    });

  } catch (error) {
    showToast('Failed to load global leaderboard', 'error');
  }
}

// --- Quiz Engine Logic ---
async function verifyNicknameAndStart(quizId) {
  const userData = Dashboard.getData();
  if (userData.nickname) {
    startQuizSession(quizId);
  } else {
    // Show nickname modal
    const modal = document.getElementById('nickname-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const input = document.getElementById('modal-nickname-input');
    const startBtn = document.getElementById('modal-nickname-submit');
    const closeBtn = document.getElementById('modal-nickname-close');

    closeBtn.onclick = () => {
      modal.classList.remove('flex');
      modal.classList.add('hidden');
    };

    startBtn.onclick = () => {
      const nickname = input.value.trim();
      if (!nickname) {
        showToast('Please enter a valid nickname', 'warning');
        return;
      }
      Dashboard.setNickname(nickname);
      modal.classList.remove('flex');
      modal.classList.add('hidden');
      startQuizSession(quizId);
    };
  }
}

async function startQuizSession(quizId) {
  try {
    showToast('Loading quiz environment...', 'info');
    
    // Load quiz questions
    state.currentQuiz = await Api.startQuiz(quizId);
    state.currentQuizMeta = await Api.fetchQuizById(quizId);
    state.currentQuestionIndex = 0;
    state.userAnswers = {};
    state.flaggedQuestions.clear();
    state.totalTime = state.currentQuiz.duration * 60;
    state.timeRemaining = state.totalTime;

    router('quiz');
    
    // Initialize navigation navigator side panel
    renderQuestionNavigator();
    
    // Show first question
    showQuestion(0);
    
    // Start countdown timer
    startTimer();
    
    showToast('Quiz started! Good luck!', 'success');
  } catch (error) {
    showToast('Failed to start quiz. Try again.', 'error');
  }
}

function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  
  updateTimerUI();
  
  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    updateTimerUI();

    if (state.timeRemaining <= 0) {
      clearInterval(state.timerInterval);
      showToast('Time is up! Submitting answers automatically...', 'warning');
      submitQuizSession(true);
    }
  }, 1000);
}

function updateTimerUI() {
  const mins = Math.floor(state.timeRemaining / 60);
  const secs = state.timeRemaining % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  const timerText = document.getElementById('quiz-timer-text');
  timerText.innerText = timeStr;

  // Add flashing warning when timer is below 1 minute
  if (state.timeRemaining < 60) {
    timerText.classList.add('text-red-500', 'animate-pulse');
  } else {
    timerText.classList.remove('text-red-500', 'animate-pulse');
  }

  // Update visual progress bar
  const progressPercent = (state.timeRemaining / state.totalTime) * 100;
  const timerBar = document.getElementById('quiz-timer-bar');
  timerBar.style.width = `${progressPercent}%`;
}

function renderQuestionNavigator() {
  const container = document.getElementById('question-nav-grid');
  container.innerHTML = '';

  state.currentQuiz.questions.forEach((q, index) => {
    const btn = document.createElement('button');
    btn.id = `nav-dot-${index}`;
    btn.className = 'w-10 h-10 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-sm font-semibold flex items-center justify-center transition-all nav-grid-btn hover:scale-105';
    btn.innerText = index + 1;
    
    btn.addEventListener('click', () => {
      saveActiveQuestionAnswer();
      showQuestion(index);
    });

    container.appendChild(btn);
  });
  
  updateQuestionNavigatorDots();
}

function updateQuestionNavigatorDots() {
  state.currentQuiz.questions.forEach((q, index) => {
    const dot = document.getElementById(`nav-dot-${index}`);
    if (!dot) return;

    // Reset styles
    dot.className = 'w-10 h-10 rounded-lg border-2 text-sm font-semibold flex items-center justify-center transition-all nav-grid-btn hover:scale-105';

    const isCurrent = index === state.currentQuestionIndex;
    const isFlagged = state.flaggedQuestions.has(index);
    const isAnswered = isQuestionAnswered(q.id);

    if (isCurrent) {
      dot.classList.add('border-indigo-600', 'text-indigo-600', 'dark:border-indigo-400', 'dark:text-indigo-400', 'ring-2', 'ring-indigo-600/20');
    } else if (isFlagged) {
      dot.classList.add('border-amber-500', 'bg-amber-500/10', 'text-amber-600', 'dark:text-amber-400');
    } else if (isAnswered) {
      dot.classList.add('border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400');
    } else {
      dot.classList.add('border-slate-300', 'dark:border-slate-700', 'text-slate-500', 'dark:text-slate-400');
    }
  });
}

function isQuestionAnswered(qId) {
  const ans = state.userAnswers[qId];
  if (!ans) return false;
  if (ans.selectedOptionIds && ans.selectedOptionIds.length > 0) return true;
  if (ans.textAnswer && ans.textAnswer.trim() !== '') return true;
  return false;
}

function showQuestion(index) {
  state.currentQuestionIndex = index;
  const question = state.currentQuiz.questions[index];
  
  // Update Header progress
  const progressPercent = ((index + 1) / state.currentQuiz.questions.length) * 100;
  document.getElementById('quiz-progress-bar').style.width = `${progressPercent}%`;
  document.getElementById('question-counter-text').innerText = `Question ${index + 1} of ${state.currentQuiz.questions.length}`;

  // Render question text
  document.getElementById('quiz-question-text').innerText = question.questionText;

  // Render image if present
  const imgContainer = document.getElementById('quiz-question-image-container');
  if (question.imageUrl) {
    imgContainer.innerHTML = `<img src="${question.imageUrl}" alt="Question Image" class="max-h-64 rounded-lg object-contain mx-auto shadow-md">`;
    imgContainer.classList.remove('hidden');
  } else {
    imgContainer.classList.add('hidden');
  }

  // Render answers input container depending on question type
  const optionsContainer = document.getElementById('quiz-options-container');
  optionsContainer.innerHTML = '';

  const savedAnswer = state.userAnswers[question.id] || { selectedOptionIds: [], textAnswer: '' };

  if (question.questionType === 'FILL_IN_THE_BLANK') {
    optionsContainer.className = 'w-full max-w-xl mx-auto py-6';
    optionsContainer.innerHTML = `
      <label class="block text-sm font-semibold mb-2 text-slate-500">Your Answer:</label>
      <input type="text" id="blank-input" class="w-full px-4 py-3 glass-input text-lg font-medium" placeholder="Type your answer here..." value="${savedAnswer.textAnswer}">
    `;
    
    // Auto-save input
    document.getElementById('blank-input').addEventListener('input', (e) => {
      state.userAnswers[question.id] = {
        selectedOptionIds: [],
        textAnswer: e.target.value
      };
      updateQuestionNavigatorDots();
    });

  } else {
    optionsContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 w-full';
    
    question.options.forEach(opt => {
      const btn = document.createElement('button');
      const isSelected = savedAnswer.selectedOptionIds.includes(opt.id);
      
      btn.className = `option-btn w-full p-4 rounded-xl text-left font-medium flex items-center justify-between text-base border-2 ${
        isSelected ? 'selected' : ''
      }`;
      btn.innerHTML = `
        <span>${opt.optionText}</span>
        <span class="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs text-white ${
          isSelected ? 'bg-indigo-600 border-indigo-600' : ''
        }">
          ${isSelected ? '✓' : ''}
        </span>
      `;

      btn.addEventListener('click', () => {
        handleOptionClick(question, opt.id, btn);
      });

      optionsContainer.appendChild(btn);
    });
  }

  // Update navigation button states
  document.getElementById('prev-question-btn').disabled = index === 0;
  document.getElementById('next-question-btn').innerText = index === state.currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question';
  
  // Flag button state
  const flagBtn = document.getElementById('flag-question-btn');
  if (state.flaggedQuestions.has(index)) {
    flagBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-amber-500 fill-current" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
      Unflag
    `;
    flagBtn.classList.add('border-amber-500/50', 'bg-amber-500/10', 'text-amber-600', 'dark:text-amber-400');
  } else {
    flagBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
      Flag Question
    `;
    flagBtn.className = 'flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold transition-all hover:bg-slate-100/50 dark:hover:bg-slate-800/50';
  }

  updateQuestionNavigatorDots();
}

function handleOptionClick(question, optionId, btnElement) {
  const savedAnswer = state.userAnswers[question.id] || { selectedOptionIds: [], textAnswer: '' };

  if (question.questionType === 'MULTIPLE_CHOICE') {
    const idx = savedAnswer.selectedOptionIds.indexOf(optionId);
    if (idx > -1) {
      savedAnswer.selectedOptionIds.splice(idx, 1);
      btnElement.classList.remove('selected');
      btnElement.querySelector('span:last-child').className = 'w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs text-white';
      btnElement.querySelector('span:last-child').innerHTML = '';
    } else {
      savedAnswer.selectedOptionIds.push(optionId);
      btnElement.classList.add('selected');
      btnElement.querySelector('span:last-child').className = 'w-6 h-6 rounded-full border border-indigo-600 bg-indigo-600 flex items-center justify-center text-xs text-white';
      btnElement.querySelector('span:last-child').innerHTML = '✓';
    }
  } else { // SINGLE_CHOICE or TRUE_FALSE
    // Clear other selections
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.option-btn span:last-child').forEach(s => {
      s.className = 'w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs text-white';
      s.innerHTML = '';
    });
    
    savedAnswer.selectedOptionIds = [optionId];
    btnElement.classList.add('selected');
    btnElement.querySelector('span:last-child').className = 'w-6 h-6 rounded-full border border-indigo-600 bg-indigo-600 flex items-center justify-center text-xs text-white';
    btnElement.querySelector('span:last-child').innerHTML = '✓';
  }

  state.userAnswers[question.id] = savedAnswer;
  updateQuestionNavigatorDots();
}

function saveActiveQuestionAnswer() {
  const blankInput = document.getElementById('blank-input');
  if (blankInput) {
    const qId = state.currentQuiz.questions[state.currentQuestionIndex].id;
    state.userAnswers[qId] = {
      selectedOptionIds: [],
      textAnswer: blankInput.value
    };
  }
}

function previousQuestion() {
  if (state.currentQuestionIndex > 0) {
    saveActiveQuestionAnswer();
    showQuestion(state.currentQuestionIndex - 1);
  }
}

function nextQuestion() {
  saveActiveQuestionAnswer();
  if (state.currentQuestionIndex < state.currentQuiz.questions.length - 1) {
    showQuestion(state.currentQuestionIndex + 1);
  } else {
    // Finish Quiz
    confirmSubmitQuiz();
  }
}

function toggleFlagQuestion() {
  if (state.flaggedQuestions.has(state.currentQuestionIndex)) {
    state.flaggedQuestions.delete(state.currentQuestionIndex);
  } else {
    state.flaggedQuestions.add(state.currentQuestionIndex);
  }
  showQuestion(state.currentQuestionIndex);
}

function confirmSubmitQuiz() {
  const answeredCount = Object.keys(state.userAnswers).filter(qId => isQuestionAnswered(qId)).length;
  const unansweredCount = state.currentQuiz.questions.length - answeredCount;

  let msg = `Are you sure you want to submit?`;
  if (unansweredCount > 0) {
    msg += ` You have left ${unansweredCount} question(s) unanswered.`;
  }

  if (confirm(msg)) {
    submitQuizSession(false);
  }
}

async function submitQuizSession(isTimeOut = false) {
  try {
    saveActiveQuestionAnswer();
    clearInterval(state.timerInterval);
    if (state.isFullscreen) {
      exitFullscreen();
    }

    showToast('Submitting answers to server...', 'info');

    // Build payload answers list
    const answersList = [];
    state.currentQuiz.questions.forEach(q => {
      const ans = state.userAnswers[q.id] || { selectedOptionIds: [], textAnswer: '' };
      answersList.push({
        questionId: q.id,
        selectedOptionIds: ans.selectedOptionIds,
        textAnswer: ans.textAnswer
      });
    });

    const userData = Dashboard.getData();
    const timeTaken = state.totalTime - state.timeRemaining;

    // Call REST endpoint
    const response = await Api.submitQuiz(
      state.currentQuiz.id,
      userData.nickname || 'Anonymous',
      timeTaken,
      answersList
    );

    // Save locally for gamification and tracking
    const rewardMeta = Dashboard.recordResult(response, state.currentQuizMeta);

    // Load results view
    renderResultsPage(response, rewardMeta);
    
  } catch (error) {
    showToast('Error submitting quiz answers.', 'error');
  }
}

// --- Results View Renderer ---
function renderResultsPage(res, rewards) {
  router('result');

  // Load radial chart
  const progressCircle = document.getElementById('result-radial');
  progressCircle.style.background = `conic-gradient(
    #4F46E5 ${res.percentage}%,
    rgba(148, 163, 184, 0.1) ${res.percentage}%
  )`;
  document.getElementById('result-percentage-text').innerText = `${res.percentage}%`;

  // Summary metadata
  document.getElementById('res-score').innerText = `${res.score} / ${res.totalQuestions}`;
  document.getElementById('res-time').innerText = `${Math.floor(res.timeTaken / 60)}m ${res.timeTaken % 60}s`;
  document.getElementById('res-correct').innerText = res.correctCount;
  document.getElementById('res-wrong').innerText = res.wrongCount;

  // XP, Streaks and Badges earned card
  const rewardMsg = document.getElementById('rewards-summary');
  rewardMsg.innerHTML = `
    <div class="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400 font-bold mb-2">
      <span>✨ Earned +${rewards.earnedXp} XP</span>
      <span>•</span>
      <span>🔥 Streak: ${rewards.streak} days</span>
    </div>
  `;

  if (rewards.newBadges && rewards.newBadges.length > 0) {
    let badgesHtml = `<div class="mt-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-3"><h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Unlocked Achievements:</h4><div class="flex flex-wrap gap-2">`;
    rewards.newBadges.forEach(badge => {
      badgesHtml += `
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <span class="mr-1">${badge.icon}</span> ${badge.name}
        </span>
      `;
    });
    badgesHtml += `</div></div>`;
    rewardMsg.innerHTML += badgesHtml;
  }

  // Draw chart correct/incorrect
  Dashboard.renderResultPieChart('result-breakdown-chart', res.correctCount, res.wrongCount);

  // Recommendations and Feedbacks
  const strengthsContainer = document.getElementById('result-strengths-list');
  strengthsContainer.innerHTML = '';
  res.feedback.strengths.forEach(s => {
    const li = document.createElement('li');
    li.className = 'text-sm text-emerald-600 dark:text-emerald-400 flex items-start';
    li.innerHTML = `<span class="mr-2">✓</span><span>${s}</span>`;
    strengthsContainer.appendChild(li);
  });

  const improvementsContainer = document.getElementById('result-improvements-list');
  improvementsContainer.innerHTML = '';
  res.feedback.improvements.forEach(imp => {
    const li = document.createElement('li');
    li.className = 'text-sm text-slate-500 dark:text-slate-400 flex items-start';
    li.innerHTML = `<span class="mr-2">•</span><span>${imp}</span>`;
    improvementsContainer.appendChild(li);
  });

  // Render suggested quizzes
  const suggestionsGrid = document.getElementById('result-suggested-grid');
  suggestionsGrid.innerHTML = '';
  
  if (res.feedback.suggestedQuizzes.length === 0) {
    suggestionsGrid.innerHTML = `<p class="text-slate-400 text-xs italic">No additional suggestions right now.</p>`;
  } else {
    res.feedback.suggestedQuizzes.forEach(quiz => {
      const card = document.createElement('div');
      card.className = 'glass-card p-4 hover:scale-100/98 cursor-pointer flex flex-col justify-between';
      card.innerHTML = `
        <div>
          <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200 line-clamp-1 mb-1">${quiz.title}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">${quiz.description}</p>
        </div>
        <div class="mt-4 flex justify-between items-center text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
          <span>Start Quiz</span>
          <span>→</span>
        </div>
      `;
      card.addEventListener('click', () => {
        router('quiz-detail', { quizId: quiz.id });
      });
      suggestionsGrid.appendChild(card);
    });
  }

  // Setup action buttons
  document.getElementById('btn-retry-quiz').onclick = () => {
    startQuizSession(state.currentQuiz.id);
  };

  document.getElementById('btn-download-pdf').onclick = () => {
    downloadCertificatePdf(res, state.currentQuizMeta);
  };
}

// --- User Dashboard Manager ---
function renderUserDashboard() {
  const data = Dashboard.getData();

  // Set Profile Name
  document.getElementById('dashboard-nickname-input').value = data.nickname || '';
  document.getElementById('dashboard-title-name').innerText = data.nickname || 'Guest';

  // Gamification Stats
  document.getElementById('dashboard-xp-text').innerText = `${data.xp} XP`;
  document.getElementById('dashboard-streak-text').innerText = `${data.streak} Days`;
  
  const currentLevel = Dashboard.calculateLevel(data.xp);
  const nextLevel = currentLevel + 1;
  const xpBase = Dashboard.xpForNextLevel(currentLevel - 1);
  const xpTarget = Dashboard.xpForNextLevel(currentLevel);
  const levelProgressPercent = ((data.xp - xpBase) / (xpTarget - xpBase)) * 100;

  document.getElementById('dashboard-level-badge').innerText = `Level ${currentLevel}`;
  document.getElementById('dashboard-level-bar').style.width = `${levelProgressPercent}%`;
  document.getElementById('dashboard-level-progress-text').innerText = `${data.xp} / ${xpTarget} XP to Level ${nextLevel}`;

  // Achievements/Badges Grid
  const badgesGrid = document.getElementById('dashboard-badges-grid');
  badgesGrid.innerHTML = '';

  const badgesWithState = Dashboard.getBadgesWithState();
  badgesWithState.forEach(badge => {
    const card = document.createElement('div');
    card.className = `p-4 rounded-xl flex items-center space-x-3 border ${
      badge.unlocked 
        ? 'border-indigo-600/30 bg-indigo-500/5 dark:bg-indigo-500/10' 
        : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 opacity-50'
    }`;
    card.innerHTML = `
      <div class="text-3xl">${badge.unlocked ? badge.icon : '🔒'}</div>
      <div>
        <h4 class="font-bold text-sm ${badge.unlocked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}">${badge.name}</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400">${badge.description}</p>
        ${badge.unlocked ? `<span class="text-[10px] font-bold text-amber-500 uppercase tracking-wide">🏆 Unlocked (+${badge.xpBonus} XP)</span>` : ''}
      </div>
    `;
    badgesGrid.appendChild(card);
  });

  // Recent Quizzes Attempt history list
  const historyList = document.getElementById('dashboard-history-list');
  historyList.innerHTML = '';

  if (data.history.length === 0) {
    historyList.innerHTML = `<li class="py-4 text-center text-slate-500 dark:text-slate-400">No quizzes attempted yet. Start one now!</li>`;
  } else {
    // Show newest first
    [...data.history].reverse().slice(0, 5).forEach(item => {
      const li = document.createElement('li');
      li.className = 'py-3 flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50';
      
      const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });

      li.innerHTML = `
        <div>
          <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200 line-clamp-1">${item.quizTitle}</h4>
          <span class="text-xs text-slate-400">${formattedDate} • ${item.categoryName} • ${item.timeTaken}s</span>
        </div>
        <div class="text-right">
          <span class="font-bold text-indigo-600 dark:text-indigo-400 text-sm">${item.percentage}%</span>
          <div class="text-xs text-slate-400">${item.score}/${item.totalQuestions}</div>
        </div>
      `;
      historyList.appendChild(li);
    });
  }

  // Render Charts
  Dashboard.renderAnalytics('dashboard-chart', data.history);
}

// --- Full Screen management ---
function toggleFullscreen() {
  const container = document.getElementById('quiz-view');
  
  if (!state.isFullscreen) {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen(); // Safari support
    }
    state.isFullscreen = true;
    document.getElementById('fullscreen-icon').innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9L4 4m0 0l5-5M4 4h5M15 15l5 5m0 0l-5 5m5-5h-5" />`; // standard exit icon
  } else {
    exitFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
  state.isFullscreen = false;
  document.getElementById('fullscreen-icon').innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />`;
}

// --- Keyboard Shortcuts Manager ---
function handleKeyboardShortcuts(e) {
  if (state.activeView !== 'quiz') return;

  const key = e.key;

  // Question navigation
  if (key === 'ArrowRight') {
    nextQuestion();
  } else if (key === 'ArrowLeft') {
    previousQuestion();
  }

  // Flag Question (Key F)
  if (key === 'f' || key === 'F') {
    // Only toggle if not focused in inputs (like fill in the blank text)
    if (document.activeElement.id !== 'blank-input') {
      toggleFlagQuestion();
    }
  }

  // Option selection via keyboard numbers 1-9
  if (key >= '1' && key <= '9') {
    if (document.activeElement.id !== 'blank-input') {
      const optionIndex = parseInt(key) - 1;
      const question = state.currentQuiz.questions[state.currentQuestionIndex];
      if (question && question.options && question.options[optionIndex]) {
        const option = question.options[optionIndex];
        const btn = document.querySelectorAll('.option-btn')[optionIndex];
        if (btn) {
          handleOptionClick(question, option.id, btn);
        }
      }
    }
  }
}

// --- PDF Certificate Generation ---
function downloadCertificatePdf(res, quizMeta) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [600, 420]
  });

  const userData = Dashboard.getData();
  const userName = userData.nickname || 'Quiz Winner';

  // Draw background border
  doc.setDrawColor(79, 70, 229); // Primary Indigo
  doc.setLineWidth(10);
  doc.rect(10, 10, 580, 400);

  // Inner border
  doc.setDrawColor(6, 182, 212); // Accent Cyan
  doc.setLineWidth(2);
  doc.rect(20, 20, 560, 380);

  // Certificate Heading
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(79, 70, 229);
  doc.text('CERTIFICATE OF ACHIEVEMENT', 300, 70, { align: 'center' });

  // Subtitle
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139);
  doc.text('This is proudly presented to', 300, 120, { align: 'center' });

  // User Name
  doc.setFont('Helvetica', 'bolditalic');
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  doc.text(userName, 300, 160, { align: 'center' });
  doc.line(180, 168, 420, 168); // underline

  // Body Text
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`For successfully completing the quiz`, 300, 200, { align: 'center' });

  // Quiz Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(124, 58, 237); // Secondary purple
  doc.text(quizMeta.title, 300, 230, { align: 'center' });

  // Score stats
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`Category: ${quizMeta.categoryName}  |  Difficulty: ${quizMeta.difficulty}`, 300, 260, { align: 'center' });

  // Big Score Stat Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.rect(200, 280, 200, 50, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(16, 185, 129); // Success Emerald
  doc.text(`Score: ${res.percentage}% (${res.score}/${res.totalQuestions})`, 300, 300, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`Completed in ${res.timeTaken} seconds`, 300, 318, { align: 'center' });

  // Footer/Signatures
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 60, 360);
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(79, 70, 229);
  doc.text('QUIZ PORTAL ENGINE', 540, 360, { align: 'right' });

  // Save/Download PDF
  doc.save(`Certificate_${quizMeta.title.replace(/\s+/g, '_')}.pdf`);
  showToast('Certificate PDF downloaded successfully!', 'success');
}

// --- Helper Functions ---
function getDifficultyBadgeClass(diff) {
  switch (diff.toUpperCase()) {
    case 'EASY':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'HARD':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400';
  }
}

function getCategoryIcon(catName) {
  const norm = catName.toLowerCase();
  if (norm.includes('java')) return '☕';
  if (norm.includes('web') || norm.includes('javascript') || norm.includes('html')) return '💻';
  if (norm.includes('geo') || norm.includes('knowledge') || norm.includes('world')) return '🌍';
  if (norm.includes('science') || norm.includes('space') || norm.includes('astronomy')) return '🚀';
  if (norm.includes('math') || norm.includes('algebra')) return '🔢';
  return '📝';
}

function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  let bg = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200';
  let icon = 'ℹ️';

  if (type === 'success') {
    bg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
    icon = '✅';
  } else if (type === 'error') {
    bg = 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400';
    icon = '❌';
  } else if (type === 'warning') {
    bg = 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
    icon = '⚠️';
  }

  toast.className = `flex items-center p-4 border rounded-xl shadow-lg transform translate-y-2 opacity-0 transition-all duration-300 ${bg}`;
  toast.innerHTML = `<span class="mr-3 text-lg">${icon}</span><span class="font-medium text-sm">${message}</span>`;
  
  toastContainer.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  // Auto-remove
  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}
