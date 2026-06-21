/**
 * API Wrapper for Quiz Portal REST Services
 */

const API_BASE = '/api';

export const Api = {
  /**
   * Fetch all quiz categories
   */
  async fetchCategories() {
    try {
      const response = await fetch(`${API_BASE}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Query quizzes with filter options
   */
  async fetchQuizzes(categoryId = null, difficulty = null, search = '') {
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append('category', categoryId);
      if (difficulty) params.append('difficulty', difficulty);
      if (search) params.append('search', search);

      const response = await fetch(`${API_BASE}/quizzes?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },

  /**
   * Fetch quiz details by ID
   */
  async fetchQuizById(quizId) {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${quizId}`);
      if (!response.ok) throw new Error('Failed to fetch quiz details');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching quiz ${quizId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch quiz questions (without answers) to start the quiz
   */
  async startQuiz(quizId) {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${quizId}/start`);
      if (!response.ok) throw new Error('Failed to start quiz session');
      return await response.json();
    } catch (error) {
      console.error(`Error starting quiz ${quizId}:`, error);
      throw error;
    }
  },

  /**
   * Submit completed quiz answers for grading
   */
  async submitQuiz(quizId, username, timeTaken, answers) {
    try {
      const payload = {
        username: username,
        timeTaken: timeTaken,
        answers: answers // List of { questionId, selectedOptionIds, textAnswer }
      };

      const response = await fetch(`${API_BASE}/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to submit quiz results');
      return await response.json();
    } catch (error) {
      console.error(`Error submitting quiz ${quizId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch global leaderboard
   */
  async fetchGlobalLeaderboard() {
    try {
      const response = await fetch(`${API_BASE}/leaderboard`);
      if (!response.ok) throw new Error('Failed to fetch global leaderboard');
      return await response.json();
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      throw error;
    }
  },

  /**
   * Fetch leaderboard for a specific quiz
   */
  async fetchQuizLeaderboard(quizId) {
    try {
      const response = await fetch(`${API_BASE}/leaderboard/quiz/${quizId}`);
      if (!response.ok) throw new Error('Failed to fetch quiz leaderboard');
      return await response.json();
    } catch (error) {
      console.error(`Error fetching leaderboard for quiz ${quizId}:`, error);
      throw error;
    }
  }
};
