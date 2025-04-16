<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import QuizCard from '~/components/QuizCard.vue';

const quizzes = ref([]);
const isLoading = ref(true);
const difficultyLevels = ref([]);
const selectedDifficulty = ref(null);

// Get all quizzes
async function fetchQuizzes() {
  isLoading.value = true;
  try {
    let url = import.meta.env.VITE_API_URL + '/api/quizzes';
    
    if (selectedDifficulty.value) {
      url += `?difficulty=${selectedDifficulty.value}`;
    }
    
    const response = await axios.get(url);
    quizzes.value = response.data;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
  } finally {
    isLoading.value = false;
  }
}

// Get difficulty levels for filtering
async function fetchDifficultyLevels() {
  try {
    const response = await axios.get(import.meta.env.VITE_API_URL + '/api/quiz-difficulty-levels');
    difficultyLevels.value = response.data;
  } catch (error) {
    console.error('Error fetching difficulty levels:', error);
  }
}

// Reset difficulty filter
function resetFilter() {
  selectedDifficulty.value = null;
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
      <!-- Page Header -->
      <v-row class="mt-8 mb-6">
        <v-col cols="12" md="8">
          <h1 class="text-h3 font-weight-bold mb-2">Available Quizzes</h1>
          <p class="text-subtitle-1 text-medium-emphasis">
            Choose a quiz from the list below to test your knowledge.
          </p>
        </v-col>
        
        <!-- Difficulty Filter -->
        <v-col cols="12" md="4" class="d-flex align-center justify-end">
          <div class="d-flex align-center">
            <v-select
              v-model="selectedDifficulty"
              :items="difficultyLevels"
              item-title="label"
              item-value="value"
              label="Filter by Difficulty"
              variant="outlined"
              density="comfortable"
              class="me-2"
              hide-details
              :item-props="item => ({
                prependAvatar: undefined,
                prependIcon: undefined,
                subtitle: undefined,
                title: item.label,
                value: item.value,
                props: {
                  prepend: () => {
                    return h('v-icon', {
                      icon: 'mdi-circle',
                      color: item.color,
                      size: 'x-small',
                      class: 'me-2'
                    })
                  }
                }
              })"
            ></v-select>
            
            <v-btn
              v-if="selectedDifficulty"
              icon="mdi-close"
              variant="text"
              size="small"
              @click="resetFilter"
              class="ml-1"
              color="default"
            ></v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <div v-if="isLoading" class="d-flex justify-center align-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
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
        ></v-icon>
        
        <h3 class="text-h5 font-weight-bold mb-2">No Quizzes Found</h3>
        
        <p class="text-body-1 text-medium-emphasis mb-4">
          {{ selectedDifficulty 
            ? `There are no quizzes with ${selectedDifficulty} difficulty.` 
            : 'There are no quizzes available at the moment.' 
          }}
        </p>
        
        <v-btn
          v-if="selectedDifficulty"
          color="primary"
          variant="outlined"
          prepend-icon="mdi-refresh"
          @click="resetFilter"
        >
          Clear Filter
        </v-btn>
      </v-card>
    </v-container>
  </div>
</template>
