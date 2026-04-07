/**
 * Judge API Service
 * Centralized service for all judge-related API calls
 * 
 * Usage:
 * import { judgeApi } from './services/judgeApi';
 * 
 * // Get contestants
 * const contestants = await judgeApi.getContestants();
 * 
 * // Submit score
 * await judgeApi.submitScore({ contestantId, creativity, presentation, skillLevel, audienceImpact });
 */

import { api } from './apiClient';

export const judgeApi = {
  /**
   * Get judge's profile information
   * @param {string} token - Authentication token
   * @returns {Promise} Judge profile data
   */
  getProfile: async (token) => {
    try {
      const response = await api.get({ path: '/judges/profile', token });
      return response;
    } catch (error) {
      console.error('Error fetching judge profile:', error);
      throw error;
    }
  },

  /**
   * Get all contestants available for judging
   * @param {Object} token - Authentication token
   * @returns {Promise} Array of contestants
   */
  getContestants: async (params = {}, token) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/judges/contestants${queryString ? '?' + queryString : ''}`;
      const response = await api.get({ path: url, token });
      return response.data || response;
    } catch (error) {
      console.error('Error fetching contestants:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all scores submitted for a specific contestant
   * @param {string} contestantId - MongoDB ID of the contestant
   * @returns {Promise} Contestant scores and averages
   */
  getContestantScores: async (contestantId) => {
    try {
      const response = await apiClient.get(`/judges/scores/${contestantId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching scores for contestant ${contestantId}:`, error);
      throw error.response?.data || error;
    }
  },

  /**
   * Submit scores for a contestant
   * @param {Object} scoreData - Score data
   * @param {string} scoreData.contestantId - MongoDB ID of contestant
   * @param {number} scoreData.creativity - Creativity score (0-25)
   * @param {number} scoreData.presentation - Presentation score (0-25)
   * @param {number} scoreData.skillLevel - Skill level score (0-25)
   * @param {number} scoreData.audienceImpact - Audience impact score (0-25)
   * @param {string} [scoreData.notes] - Optional notes
   * @returns {Promise} Submission response with score ID
   */
  submitScore: async (scoreData, token) => {
    try {
      // Validate score data
      const { contestantId, creativity, presentation, skillLevel, audienceImpact } = scoreData;
      
      if (!contestantId) {
        throw new Error('Contestant ID is required');
      }

      if (!token) {
        throw new Error('Authentication token is required');
      }

      [creativity, presentation, skillLevel, audienceImpact].forEach(score => {
        if (score < 0 || score > 25) {
          throw new Error('Each criteria score must be between 0 and 25');
        }
      });

      console.log('📤 Submitting score to API:', { contestantId, creativity, presentation, skillLevel, audienceImpact });
      
      const response = await api.post({ 
        path: '/judges/submit-score', 
        body: scoreData, 
        token 
      });
      
      console.log('✅ Score submitted successfully:', response);
      return response;
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update an existing score
   * @param {string} scoreId - MongoDB ID of the score to update
   * @param {Object} updates - Updated score data (only provide fields to update)
   * @param {string} token - Authentication token
   * @returns {Promise} Updated score data
   */
  updateScore: async (scoreId, updates, token) => {
    try {
      const response = await api.put({ path: `/judges/scores/${scoreId}`, body: updates, token });
      return response.data;
    } catch (error) {
      console.error(`Error updating score ${scoreId}:`, error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get judge's personal scoreboard (their scores ranked)
   * @param {Object} params - Query parameters
   * @param {string} [params.category] - Filter by talent category
   * @returns {Promise} Array of contestants ranked by judge's scores
   */
  getScoreboard: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/judges/scoreboard${queryString ? '?' + queryString : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching judge scoreboard:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get overall scoreboard with average scores from all judges
   * @param {Object} params - Query parameters
   * @param {string} [params.round] - Filter by round (qualifier, semi-final, final)
   * @param {string} [params.category] - Filter by talent category
   * @returns {Promise} Array of contestants with average scores
   */
  getOverallScoreboard: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/judges/overall-scoreboard${queryString ? '?' + queryString : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching overall scoreboard:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get judge's scoring progress statistics
   * @returns {Promise} Progress data with totals and breakdowns
   */
  getProgress: async () => {
    try {
      const response = await apiClient.get('/judges/progress');
      return response.data;
    } catch (error) {
      console.error('Error fetching judge progress:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Calculate total score from criteria
   * @param {number} creativity 
   * @param {number} presentation 
   * @param {number} skillLevel 
   * @param {number} audienceImpact 
   * @returns {number} Total score (0-100)
   */
  calculateTotalScore: (creativity, presentation, skillLevel, audienceImpact) => {
    return creativity + presentation + skillLevel + audienceImpact;
  },

  /**
   * Format score for display
   * @param {Object} criteria - Criteria object
   * @returns {string} Formatted score string
   */
  formatScore: (criteria) => {
    if (!criteria) return '0/100';
    const total = criteria.creativity + criteria.presentation + criteria.skillLevel + criteria.audienceImpact;
    return `${total}/100`;
  },
};

export default judgeApi;
