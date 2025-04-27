import apiClient from './apiService';
import type { Category } from '~/types';

export const categoryService = {
  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get<Category[]>('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};

export default categoryService;