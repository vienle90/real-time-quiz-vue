import Pusher from 'pusher-js';
import type { QuizUser } from '~/types';

// Initialize Pusher client
const pusher = new Pusher('ab79b520a9a82017626a', {
  cluster: 'ap1'
});

export interface LeaderboardChangedEvent {
  topUsers: QuizUser[];
}

export const realtimeService = {
  /**
   * Subscribe to a quiz channel
   */
  subscribeToQuiz: (quizId: string | number) => {
    return pusher.subscribe(`quiz.${quizId}`);
  },

  /**
   * Unsubscribe from a quiz channel
   */
  unsubscribeFromQuiz: (quizId: string | number) => {
    pusher.unsubscribe(`quiz.${quizId}`);
  }
};

export default realtimeService;