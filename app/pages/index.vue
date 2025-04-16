<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';

const quizzes = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const sortBy = ref('newest');

// Fetch quizzes from API
onMounted(async () => {
  try {
    const url = import.meta.env.VITE_API_URL + '/api/quizzes';
    const response = await axios.get(url);
    quizzes.value = response.data.map(quiz => ({
      ...quiz,
      participants: Math.floor(Math.random() * 1000), // Simulated data
      difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)], // Simulated data
      category: ['General Knowledge', 'Science', 'History', 'Entertainment', 'Sports'][Math.floor(Math.random() * 5)] // Simulated data
    }));
  } catch (error) {
    console.error('Error fetching quizzes:', error);
  } finally {
    isLoading.value = false;
  }
});

// Computed properties for filtering and sorting
const filteredQuizzes = computed(() => {
  if (!searchQuery.value) return quizzes.value;
  
  const query = searchQuery.value.toLowerCase();
  return quizzes.value.filter(quiz => 
    quiz.title.toLowerCase().includes(query) || 
    quiz.description.toLowerCase().includes(query) ||
    quiz.category.toLowerCase().includes(query)
  );
});

const sortedQuizzes = computed(() => {
  const sorted = [...filteredQuizzes.value];
  
  switch (sortBy.value) {
    case 'newest':
      // Assuming id is higher for newer quizzes
      return sorted.sort((a, b) => b.id - a.id);
    case 'popular':
      return sorted.sort((a, b) => b.participants - a.participants);
    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
});

// Handle category filtering
const filterByCategory = (category) => {
  searchQuery.value = category;
};

// Get featured quizzes (just taking the first 3 for now)
const featuredQuizzes = computed(() => {
  return quizzes.value.slice(0, 3);
});

// Get quiz color based on difficulty
const getQuizColor = (difficulty) => {
  switch (difficulty) {
    case 'Easy': return 'success';
    case 'Medium': return 'warning';
    case 'Hard': return 'error';
    default: return 'primary';
  }
};

// Get a random gradient for each quiz card
const getRandomGradient = () => {
  const gradients = [
    'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(to right, #fa709a 0%, #fee140 100%)',
    'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)',
    'linear-gradient(to right, #f83600 0%, #f9d423 100%)'
  ];
  
  return gradients[Math.floor(Math.random() * gradients.length)];
};
</script>

<template>
  <!-- Hero Section -->
  <section class="hero-section">
    <v-parallax
      src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg"
      :height="400"
    >
      <v-container class="h-100 d-flex flex-column justify-center">
        <v-row>
          <v-col cols="12" md="8" lg="6">
            <div class="hero-content">
              <h1 class="text-h2 font-weight-bold mb-4">
                Challenge Your Knowledge
              </h1>
              <p class="text-h6 mb-6">
                Test your skills, compete with friends, and track your progress in our real-time quiz platform.
              </p>
              <v-btn
                color="primary"
                size="large"
                class="rounded-lg text-none px-8 py-3"
                variant="elevated"
                @click="$vuetify.goTo('#quizzes-section', { duration: 500, offset: 100 })"
              >
                <v-icon icon="mdi-play-circle" class="mr-2"></v-icon>
                Get Started
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-parallax>
  </section>

  <!-- Featured Quizzes Section -->
  <section class="featured-section py-8">
    <v-container>
      <h2 class="text-h4 font-weight-bold mb-6">
        <v-icon icon="mdi-star" color="amber" class="me-2"></v-icon>
        Featured Quizzes
      </h2>
      
      <v-row>
        <v-col 
          v-for="quiz in featuredQuizzes" 
          :key="quiz.id"
          cols="12" 
          md="4"
        >
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :elevation="isHovering ? 8 : 2"
              :class="['featured-card', isHovering ? 'scale-up' : '']"
              height="220"
              :style="{ backgroundImage: getRandomGradient() }"
              @click="$router.push({ name: 'quizzes-id', params: { id: quiz.id }})"
            >
              <v-card-item>
                <div class="d-flex align-center mb-2">
                  <v-chip
                    size="small"
                    :color="getQuizColor(quiz.difficulty)"
                    class="mr-2"
                  >
                    {{ quiz.difficulty }}
                  </v-chip>
                  <v-chip
                    size="small"
                    variant="outlined"
                  >
                    {{ quiz.category }}
                  </v-chip>
                </div>
                
                <v-card-title class="text-h5 font-weight-bold text-white">
                  {{ quiz.title }}
                </v-card-title>
                
                <v-card-text class="text-white">
                  {{ quiz.description }}
                </v-card-text>
              </v-card-item>
              
              <v-card-actions class="justify-end">
                <v-btn
                  variant="elevated"
                  color="white"
                  class="text-primary font-weight-bold"
                >
                  Start Now
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
  </section>

  <!-- Main Quizzes Section -->
  <section id="quizzes-section" class="quizzes-section py-8 bg-surface">
    <v-container>
      <v-row class="mb-6">
        <v-col cols="12" sm="6">
          <h2 class="text-h4 font-weight-bold">
            <v-icon icon="mdi-view-dashboard" color="primary" class="me-2"></v-icon>
            Browse Quizzes
          </h2>
        </v-col>
        
        <v-col cols="12" sm="6">
          <div class="d-flex justify-end">
            <v-text-field
              v-model="searchQuery"
              label="Search quizzes"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              class="max-width-300"
              hide-details
            ></v-text-field>
            
            <v-select
              v-model="sortBy"
              label="Sort by"
              :items="[
                { title: 'Newest', value: 'newest' },
                { title: 'Most Popular', value: 'popular' },
                { title: 'Alphabetical', value: 'alphabetical' }
              ]"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="comfortable"
              class="ml-4 max-width-200"
              hide-details
            ></v-select>
          </div>
        </v-col>
      </v-row>
      
      <!-- Category Filter Chips -->
      <div class="mb-6">
        <v-chip-group>
          <v-chip
            @click="searchQuery = ''"
            :color="searchQuery === '' ? 'primary' : undefined"
            variant="elevated"
            class="mr-2"
          >
            All
          </v-chip>
          <v-chip
            v-for="category in ['General Knowledge', 'Science', 'History', 'Entertainment', 'Sports']"
            :key="category"
            @click="filterByCategory(category)"
            :color="searchQuery === category ? 'primary' : undefined"
            variant="elevated"
            class="mr-2"
          >
            {{ category }}
          </v-chip>
        </v-chip-group>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="d-flex justify-center my-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
      </div>
      
      <!-- No Results -->
      <v-alert
        v-else-if="sortedQuizzes.length === 0"
        type="info"
        variant="tonal"
        class="my-6"
      >
        No quizzes found matching your search criteria.
      </v-alert>
      
      <!-- Quiz Cards Grid -->
      <v-row v-else>
        <v-col
          v-for="quiz in sortedQuizzes"
          :key="quiz.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :elevation="isHovering ? 6 : 2"
              :class="['quiz-card h-100', isHovering ? 'scale-up' : '']"
            >
              <div class="quiz-card-header" :style="{ backgroundImage: getRandomGradient() }">
                <v-chip
                  size="small"
                  :color="getQuizColor(quiz.difficulty)"
                  class="difficulty-chip"
                >
                  {{ quiz.difficulty }}
                </v-chip>
              </div>
              
              <v-card-item>
                <v-card-title class="text-h6 font-weight-bold mb-2">
                  {{ quiz.title }}
                </v-card-title>
                
                <v-card-subtitle class="mb-2">
                  {{ quiz.category }}
                </v-card-subtitle>
                
                <v-card-text>
                  <p class="quiz-description">{{ quiz.description }}</p>
                  
                  <div class="d-flex align-center mt-4">
                    <v-icon icon="mdi-account-group" size="small" class="me-1"></v-icon>
                    <span class="text-caption">{{ quiz.participants }} participants</span>
                  </div>
                </v-card-text>
              </v-card-item>
              
              <v-divider></v-divider>
              
              <v-card-actions>
                <v-btn
                  variant="text"
                  color="primary"
                  prepend-icon="mdi-information"
                  @click="$router.push({ name: 'quizzes-id', params: { id: quiz.id }})"
                >
                  Details
                </v-btn>
                
                <v-spacer></v-spacer>
                
                <v-btn
                  color="primary"
                  variant="elevated"
                  append-icon="mdi-arrow-right"
                  @click="$router.push({ name: 'quizzes-id', params: { id: quiz.id }})"
                >
                  Start Quiz
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<style scoped lang="sass">
.max-width-300
  max-width: 300px

.max-width-200
  max-width: 200px

.hero-section
  .hero-content
    animation: fadeInUp 1s ease-out

.featured-card
  cursor: pointer
  transition: all 0.3s ease
  color: white
  overflow: hidden

.quiz-card
  transition: all 0.3s ease
  position: relative
  overflow: hidden

  .quiz-card-header
    height: 80px
    width: 100%
    position: relative

  .difficulty-chip
    position: absolute
    top: 10px
    right: 10px

  .quiz-description
    height: 60px
    overflow: hidden
    display: -webkit-box
    -webkit-line-clamp: 3
    -webkit-box-orient: vertical

.scale-up
  transform: translateY(-5px)

@keyframes fadeInUp
  from
    opacity: 0
    transform: translateY(20px)
  to
    opacity: 1
    transform: translateY(0)
</style>