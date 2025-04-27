import apiClient from './apiService';
import type { QuizUser } from '~/types';

export const leaderboardService = {
  /**
   * Get leaderboard for a quiz
   */
  getLeaderboard: async (quizId: string | number): Promise<QuizUser[]> => {
    try {
      const response = await apiClient.get<QuizUser[]>(`/quizzes/${quizId}/leaderboard`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching leaderboard for quiz ${quizId}:`, error);
      throw error;
    }
  }
};

export default leaderboardService;