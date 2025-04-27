import apiClient from './apiService';
import type { User, QuizUser } from '~/types';

export const userService = {
  /**
   * Create a new user
   */
  createUser: async (username: string): Promise<User> => {
    try {
      const response = await apiClient.post<User>('/users', { username });
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Join a quiz
   */
  joinQuiz: async (quizId: number | string, userId: number): Promise<QuizUser> => {
    try {
      const response = await apiClient.post<QuizUser>(`/quizzes/${quizId}/users`, { user_id: userId });
      return response.data;
    } catch (error) {
      console.error(`Error joining quiz ${quizId}:`, error);
      throw error;
    }
  },

  /**
   * Get user for a specific quiz
   */
  getQuizUser: async (quizId: number | string, userId: number): Promise<QuizUser> => {
    try {
      const response = await apiClient.get<QuizUser>(`/quizzes/${quizId}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting quiz user for quiz ${quizId} and user ${userId}:`, error);
      throw error;
    }
  }
};

export default userService;