<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import QuizCard from '~/components/QuizCard.vue';
import FeaturedQuizzes from '~/components/FeaturedQuizzes.vue';
import CategoryFilter from '~/components/CategoryFilter.vue';
import { quizService, type DifficultyLevel } from '~/services';
import type { Quiz, Category } from '~/types';

const quizzes = ref<Quiz[]>([]);
const isLoading = ref<boolean>(true);
const difficultyLevels = ref<DifficultyLevel[]>([]);
const selectedDifficulty = ref<string | null>(null);
const selectedCategoryId = ref<Category | null>(null);
const resetCategoryFilter = ref<boolean>(false);

// Get all quizzes
async function fetchQuizzes(): Promise<void> {
  isLoading.value = true;
  try {
    const params: {
      difficulty?: string;
      category_id?: string;
    } = {};
    
    // Only add difficulty param if selected
    if (selectedDifficulty.value) {
      params.difficulty = selectedDifficulty.value;
    }
    
    // Add category filter if present
    if (selectedCategoryId.value) {
      params.category_id = selectedCategoryId.value.id.toString();
    }
    
    console.log('Fetching quizzes with params:', params);
    quizzes.value = await quizService.getQuizzes(params);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
  } finally {
    isLoading.value = false;
  }
}

// Get difficulty levels for filtering
async function fetchDifficultyLevels(): Promise<void> {
  try {
    difficultyLevels.value = await quizService.getDifficultyLevels();
  } catch (error) {
    console.error('Error fetching difficulty levels:', error);
  }
}

// Reset all filters
function resetFilters(): void {
  selectedDifficulty.value = null;
  selectedCategoryId.value = null;
  
  // Force reset of the category filter component
  localStorage.removeItem('selectedCategory');
  resetCategoryFilter.value = !resetCategoryFilter.value; // Just toggle it instead of true/false
  
  fetchQuizzes();
}

// Handle category filter change
function onCategoryChange(category: Category | null): void {
  console.log('Category changed to:', category);
  selectedCategoryId.value = category;
  fetchQuizzes();
}

// Watch for difficulty changes
watch(selectedDifficulty, () => {
  fetchQuizzes();
});

onMounted(() => {
  fetchQuizzes();
  fetchDifficultyLevels();
});
</script>

<template>
  <div>
    <v-container>
      <!-- Featured Quizzes Section -->
      <featured-quizzes />
      
      <!-- Divider between sections -->
      <v-divider class="my-8"/>
      
      <!-- All Quizzes Section -->
      <v-row class="mt-8 mb-4">
        <v-col cols="12">
          <h1 class="text-h3 font-weight-bold mb-2">All Quizzes</h1>
          <p class="text-subtitle-1 text-medium-emphasis">
            Choose a quiz from the list below to test your knowledge.
          </p>
        </v-col>
      </v-row>
      
      <!-- Filters Section -->
      <div class="filters-container mb-6">
        <!-- Filter Labels -->
        <div class="filter-labels d-flex mb-1">
          <div class="filter-label flex-1">Filter by Category</div>
          <div class="filter-label flex-1">Filter by Difficulty</div>
        </div>
        
        <!-- Filter Controls -->
        <div class="d-flex align-center gap-4">
          <!-- Category Filter -->
          <div class="flex-1">
            <category-filter 
              :key="`filter-${resetCategoryFilter}`" 
              :reset="resetCategoryFilter"
              @filter-change="onCategoryChange"
            />
          </div>
          
          <!-- Difficulty Filter -->
          <div class="flex-1">
            <v-select
              v-model="selectedDifficulty"
              :items="difficultyLevels"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              item-title="label"
              item-value="value"
            >
              <template #prepend-inner>
                <v-icon icon="mdi-filter-variant" class="mr-2" />
              </template>
            </v-select>
          </div>
        </div>
        
        <!-- Removed the top "Clear Filters" button as requested -->
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="d-flex justify-center align-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
      </div>

      <!-- Quiz Cards -->
      <v-row v-else-if="quizzes.length > 0">
        <v-col
          v-for="quiz in quizzes"
          :key="quiz.id"
          cols="12"
          sm="6"
          md="4"
          class="mb-4"
        >
          <quiz-card :quiz="quiz" />
        </v-col>
      </v-row>

      <!-- Empty State -->
      <v-card
        v-else
        class="pa-8 text-center"
        variant="outlined"
        rounded="lg"
      >
        <v-icon
          icon="mdi-help-circle-outline"
          size="64"
          color="grey-lighten-1"
          class="mb-4"
        />
        
        <h3 class="text-h5 font-weight-bold mb-2">No Quizzes Found</h3>
        
        <p class="text-body-1 text-medium-emphasis mb-4">
          No quizzes match your selected filters.
        </p>
        
        <!-- Updated Clear Filters button to match the UI -->
        <v-btn
          color="primary"
          variant="tonal"
          class="clear-filters-btn"
          @click="resetFilters"
        >
          <v-icon left class="mr-2">mdi-refresh</v-icon>
          CLEAR FILTERS
        </v-btn>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped>
.filters-container {
  width: 100%;
}

.filter-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
  padding-left: 12px;
}

.flex-1 {
  flex: 1;
}

.gap-4 {
  gap: 16px;
}

.clear-filters-btn {
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Remove margin-bottom from CategoryFilter */
:deep(.category-filter) {
  margin-bottom: 0 !important;
}
</style>