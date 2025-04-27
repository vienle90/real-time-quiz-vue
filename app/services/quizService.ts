import apiClient from './apiService';
import type { Quiz } from '~/types';

interface QuizParams {
  difficulty?: string;
  category_id?: string;
}

export interface DifficultyLevel {
  label: string;
  value: string;
  color: string;
}

export const quizService = {
  /**
   * Get all quizzes with optional filters
   */
  getQuizzes: async (params: QuizParams = {}): Promise<Quiz[]> => {
    try {
      const response = await apiClient.get<Quiz[]>('/quizzes', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  },

  /**
   * Get quiz by slug or ID
   */
  getQuizBySlug: async (slug: string): Promise<Quiz> => {
    try {
      const response = await apiClient.get<Quiz>(`/quizzes/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching quiz with slug ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Get featured quizzes
   */
  getFeaturedQuizzes: async (): Promise<Quiz[]> => {
    try {
      const response = await apiClient.get<Quiz[]>('/quizzes/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured quizzes:', error);
      throw error;
    }
  },

  /**
   * Get difficulty levels for filtering
   */
  getDifficultyLevels: async (): Promise<DifficultyLevel[]> => {
    try {
      const response = await apiClient.get<DifficultyLevel[]>('/quiz-difficulty-levels');
      return response.data;
    } catch (error) {
      console.error('Error fetching difficulty levels:', error);
      throw error;
    }
  }
};

export default quizService;