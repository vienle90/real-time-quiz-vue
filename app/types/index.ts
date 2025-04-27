// Interfaces for Quiz related entities

export interface Choice {
  id: number;
  choice: string;
  question_id: number;
}

export interface Question {
  id: number;
  question: string;
  quiz_id: number;
  choices: Choice[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Difficulty {
  id: number;
  label: string;
  color: string;
  level: number;
}

export interface Quiz {
  id: number;
  title: string;
  slug: string;
  description?: string;
  difficulty?: Difficulty;
  category?: Category;
  questions_count?: number;
  participants_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  username: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuizUser {
  id: number;
  quiz_id: number;
  user_id: number;
  score: number;
  username?: string;
  joined_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionResult {
  [questionId: string]: {
    choiceId: number;
    isCorrect: boolean;
  };
}