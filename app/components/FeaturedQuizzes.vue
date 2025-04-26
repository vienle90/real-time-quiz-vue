<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import QuizCard from '~/components/QuizCard.vue';

const featuredQuizzes = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Fetch featured quizzes from the API
async function fetchFeaturedQuizzes() {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/quizzes/featured`);
    featuredQuizzes.value = response.data;
  } catch (err) {
    console.error('Error fetching featured quizzes:', err);
    error.value = 'Failed to load featured quizzes';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchFeaturedQuizzes();
});
</script>

<template>
  <section class="featured-quizzes mb-8">
    <!-- Section Header -->
    <v-row class="mb-4 align-center">
      <v-col>
        <div class="d-flex align-center">
          <v-icon icon="mdi-star" color="amber-darken-2" class="me-2" size="x-large"></v-icon>
          <h2 class="text-h4 font-weight-bold mb-0">Featured Quizzes</h2>
        </div>
        <p class="text-subtitle-1 text-medium-emphasis mt-1">
          Discover our most popular and recommended quizzes
        </p>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex justify-center align-center py-4">
      <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="mb-6"
    >
      {{ error }}
    </v-alert>

    <!-- Featured Quizzes Carousel -->
    <v-slide-group
      v-else-if="featuredQuizzes.length > 0"
      show-arrows
      class="featured-carousel pa-2"
    >
      <v-slide-group-item
        v-for="quiz in featuredQuizzes"
        :key="quiz.id"
        v-slot="{ isSelected, toggle, selectedClass }"
      >
        <div class="ma-2" style="width: 340px;">
          <!-- Add a featured badge to the regular quiz card -->
          <div class="featured-badge">
            <v-chip
              color="amber-darken-2"
              size="small"
              class="font-weight-medium"
              prepend-icon="mdi-star"
            >
              Featured
            </v-chip>
          </div>
          <quiz-card :quiz="quiz" class="featured-quiz-card" />
        </div>
      </v-slide-group-item>
    </v-slide-group>

    <!-- Empty State -->
    <v-card
      v-else
      variant="outlined"
      class="pa-6 text-center"
      rounded="lg"
    >
      <v-icon
        icon="mdi-star-outline"
        size="64"
        color="grey-lighten-1"
        class="mb-4"
      ></v-icon>
      
      <h3 class="text-h5 font-weight-bold mb-2">No Featured Quizzes</h3>
      
      <p class="text-body-1 text-medium-emphasis">
        There are no featured quizzes available at the moment.
        Check out our regular quizzes below!
      </p>
    </v-card>
  </section>
</template>

<style scoped>
.featured-quizzes {
  position: relative;
}

.featured-carousel {
  margin: 0 -12px;
}

.featured-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 2;
}

.featured-quiz-card {
  box-shadow: 0 8px 24px rgba(255, 193, 7, 0.15) !important;
  border: 1px solid rgba(255, 193, 7, 0.3) !important;
}

.featured-quiz-card:hover {
  transform: translateY(-8px) !important;
  box-shadow: 0 12px 28px rgba(255, 193, 7, 0.2) !important;
}
</style>