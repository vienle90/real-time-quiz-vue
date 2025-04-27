import apiClient from './apiService';
import type { Question } from '~/types';

interface SubmitAnswerResponse {
  choice_id: number;
  is_correct: boolean;
  score: number;
}

export const questionService = {
  /**
   * Get questions for a quiz
   */
  getQuizQuestions: async (quizId: string | number): Promise<Question[]> => {
    try {
      const response = await apiClient.get<Question[]>(`/quizzes/${quizId}/questions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching questions for quiz ${quizId}:`, error);
      throw error;
    }
  },

  /**
   * Submit an answer for a question
   */
  submitAnswer: async (
    quizId: string | number,
    questionId: string | number,
    userId: string | number,
    choiceId: number
  ): Promise<SubmitAnswerResponse> => {
    try {
      const response = await apiClient.post<SubmitAnswerResponse>(
        `/quizzes/${quizId}/questions/${questionId}/answers`,
        {
          choice_id: choiceId,
          user_id: userId
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error submitting answer for question ${questionId}:`, error);
      throw error;
    }
  }
};

export default questionService;