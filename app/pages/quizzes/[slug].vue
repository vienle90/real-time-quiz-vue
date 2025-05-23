<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import QuizLeaderboard from "~/components/QuizLeaderboard.vue";
import QuizQuestion from "~/components/QuizQuestion.vue";
import {quizService, userService} from '~/services';
import type {Quiz, QuizUser, User} from '~/types';

const route = useRoute();
const router = useRouter();

const quiz = ref<Partial<Quiz>>({});
const quizUser = ref<Partial<QuizUser>>({});
const dialog = ref<boolean>(false);
const username = ref<string>('');
const quizSlug = route.params.slug as string; // Changed from quizId to quizSlug
const quizId = ref<number | string | null>(null); // Add quizId ref to store the numeric ID
const currentUser = ref<Partial<User>>({});
const isLoading = ref<boolean>(true);
const errorDialog = ref<boolean>(false);
const errorMessage = ref<string>('');

// For animation
const showContent = ref<boolean>(false);

// Form validation
const usernameRules = [
  (v: string) => !!v || 'Username is required',
  (v: string) => (v && v.length >= 3) || 'Username must be at least 3 characters',
];
const formValid = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);

// fetchQuizDetails is now defined below

async function createUser(): Promise<void> {
  if (!formValid.value || isSubmitting.value) return;
  
  isSubmitting.value = true;
  
  try {
    const user = await userService.createUser(username.value);
    
    localStorage.user = JSON.stringify(user);
    currentUser.value = user;
    
    // Only join quiz if quizId is available
    if (quizId.value) {
      await joinQuiz();
    }
    
    dialog.value = false;
  } catch (error) {
    console.error('Error creating user:', error);
    const errorResponse = error as { response?: { data?: { message?: string } } };
    errorMessage.value = errorResponse.response?.data?.message || 'Failed to create user. Please try again.';
    errorDialog.value = true;
  } finally {
    isSubmitting.value = false;
  }
}

async function joinQuiz(): Promise<void> {
  // Check if quizId is available
  if (!quizId.value) {
    console.error('Cannot join quiz: quizId is not available');
    return;
  }
  
  try {
    if (currentUser.value.id) {
      quizUser.value = await userService.joinQuiz(quizId.value, currentUser.value.id);
    }
  } catch (error) {
    console.error('Error joining quiz:', error);
    // Check if it's a 404 error
    const errorResponse = error as { response?: { status?: number, data?: { message?: string } } };
    if (errorResponse.response && errorResponse.response.status === 404) {
      // Extract error message or use a default
      errorMessage.value = errorResponse.response.data?.message || 'User not found. Please try again.';
      // Show error dialog
      errorDialog.value = true;
    }
  }
}

function closeErrorDialog(): void {
  errorDialog.value = false;
  // Redirect to the homepage
  router.push('/');
}

async function getQuizUser(): Promise<void> {
  // Check if quizId is available
  if (!quizId.value) {
    console.error('Cannot get quiz user: quizId is not available');
    return;
  }
  
  try {
    if (currentUser.value.id) {
      quizUser.value = await userService.getQuizUser(quizId.value, currentUser.value.id);
    }
  } catch (error) {
    console.error('Error getting quiz user:', error);
    // If user is not found for this quiz, try to join the quiz
    await joinQuiz();
  }
}

function updateScore(score: number): void {
  if (quizUser.value.score !== undefined) {
    quizUser.value.score += score;
  }
}

// Get difficulty color
const difficultyColor = computed((): string => {
  if (!quiz.value.difficulty) return 'primary';
  
  return quiz.value.difficulty.color || 'primary';
});

// Get difficulty label
const difficultyLabel = computed((): string => {
  if (!quiz.value.difficulty) return 'Medium';
  
  return quiz.value.difficulty.label || 'Medium';
});

// Random color for the quiz background
const quizBgGradient = computed((): string => {
  const gradients: string[] = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    'linear-gradient(135deg, #f83600 0%, #f9d423 100%)',
    'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
    'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)'
  ];
  
  const index = Math.floor(Math.random() * gradients.length);
  return gradients[index];
});

onMounted(() => {
  const localStorageUser = localStorage.user;

  // Load user information
  if (localStorageUser === undefined) {
    dialog.value = true;
  } else {
    currentUser.value = JSON.parse(localStorageUser);
  }

  // Fetch quiz details first
  fetchQuizDetails().then(() => {
    // After quiz is fetched and quizId is available, get user quiz info
    if (currentUser.value.id && quizId.value) {
      getQuizUser();
    }
  });
});

// Update fetchQuizDetails to return a promise so we can chain operations after it
async function fetchQuizDetails(): Promise<Quiz> {
  try {
    const quizData = await quizService.getQuizBySlug(quizSlug);
    quiz.value = quizData;
    quizId.value = quizData.id; // Store the numeric ID for child components
    
    setTimeout(() => {
      showContent.value = true;
      isLoading.value = false;
    }, 300);
    
    return quizData; // Return quiz data for chaining
  } catch (error) {
    console.error('Error fetching quiz details:', error);
    isLoading.value = false;
    throw error; // Rethrow for proper promise chaining
  }
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="d-flex justify-center align-center" style="min-height: 80vh">
    <v-progress-circular
      size="70"
      width="7"
      color="primary"
      indeterminate
    >
      <span class="text-subtitle-1">Loading</span>
    </v-progress-circular>
  </div>

  <div v-else>
    <!-- Quiz Header -->
    <div 
      class="quiz-header position-relative mb-6" 
      :style="{ background: quizBgGradient }"
    >
      <v-container class="py-12">
        <v-fade-transition>
          <div v-if="showContent" class="quiz-header-content text-white">
            <v-row align="center">
              <v-col cols="12" md="8">
                <div class="d-flex align-center mb-3">
                  <v-chip
                    size="large"
                    :color="difficultyColor"
                    class="font-weight-medium text-uppercase me-2"
                    variant="elevated"
                  >
                    {{ difficultyLabel }}
                  </v-chip>
                  
                  <!-- Display quiz category -->
                  <v-chip
                    v-if="quiz.category"
                    size="large"
                    color="white"
                    class="font-weight-medium"
                    variant="elevated"
                  >
                    <span class="text-primary">{{ quiz.category.name }}</span>
                  </v-chip>
                </div>
              
                <h1 class="text-h3 font-weight-bold mb-2">{{ quiz.title }}</h1>
                <p class="text-h6 mb-6 text-medium-emphasis text-white">{{ quiz.description }}</p>
                
                <div class="d-flex flex-wrap gap-3">
                  <v-chip size="large" color="white" variant="elevated" class="font-weight-medium">
                    <v-icon start icon="mdi-help-circle" color="primary"/>
                    <span class="text-primary">{{ quiz.questions_count || '10' }} Questions</span>
                  </v-chip>
                  
                  <v-chip size="large" color="white" variant="elevated" class="font-weight-medium">
                    <v-icon start icon="mdi-account-group" color="primary"/>
                    <span class="text-primary">{{ quiz.participants_count || '25' }} Participants</span>
                  </v-chip>
                </div>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-card v-if="currentUser.id !== undefined" class="score-card elevation-10 rounded-xl">
                  <v-card-item class="pb-0">
                    <template #prepend>
                      <v-avatar color="primary" size="60">
                        <span class="text-h5 text-white">{{ currentUser.username?.charAt(0).toUpperCase() }}</span>
                      </v-avatar>
                    </template>
                    
                    <v-card-title>
                      <div class="text-h5 font-weight-bold">{{ currentUser.username }}</div>
                      <div class="text-subtitle-2 text-medium-emphasis">Quiz Participant</div>
                    </v-card-title>
                  </v-card-item>
                  
                  <v-card-text>
                    <div class="d-flex align-center mt-2">
                      <div class="text-h3 font-weight-bold text-primary me-2">{{ quizUser.score || 0 }}</div>
                      <div class="text-subtitle-1 text-medium-emphasis">points</div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-fade-transition>
      </v-container>
    </div>

    <!-- Quiz Content -->
    <v-container class="quiz-content-container">
      <v-fade-transition>
        <v-row v-if="showContent">
          <QuizQuestion 
            v-if="currentUser.id !== undefined && quizId" 
            :quiz-id="quizId" 
            :user-id="currentUser.id" 
            @score-changed="updateScore"
          />
          <QuizLeaderboard 
            :quiz-id="quizId !== null ? quizId : ''" 
            :current-user-id="currentUser.id !== undefined ? currentUser.id : null"
          />
        </v-row>
      </v-fade-transition>
    </v-container>

    <!-- Username Dialog -->
    <v-dialog
      v-model="dialog"
      persistent
      width="500"
      transition="scale-transition"
    >
      <v-card class="rounded-xl">
        <v-card-item class="pb-0">
          <template #prepend>
            <v-avatar color="primary" size="48">
              <v-icon icon="mdi-account" color="white"/>
            </v-avatar>
          </template>
          
          <v-card-title class="text-h5 font-weight-bold">
            Join This Quiz
          </v-card-title>
        </v-card-item>
        
        <v-card-text class="pt-4">
          <p class="mb-4">Enter your name to start the quiz and compete with other participants in real-time.</p>
          
          <v-form v-model="formValid" @submit.prevent="createUser">
            <v-text-field
              v-model="username"
              label="Your name"
              :rules="usernameRules"
              variant="outlined"
              prepend-inner-icon="mdi-account"
              placeholder="Enter your name"
              autofocus
              counter="30"
              class="mb-3"
            />
            
            <v-btn 
              class="mt-2" 
              type="submit" 
              block 
              color="primary" 
              size="large"
              :loading="isSubmitting"
              :disabled="!formValid || isSubmitting"
            >
              <v-icon start icon="mdi-login"/>
              {{ isSubmitting ? 'Joining...' : 'Join Quiz' }}
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    
    <!-- Error Dialog -->
    <v-dialog
      v-model="errorDialog"
      max-width="400"
      persistent
    >
      <v-card class="rounded-lg">
        <v-card-item class="bg-error text-white">
          <template #prepend>
            <v-avatar color="white" class="text-error">
              <v-icon>mdi-alert-circle</v-icon>
            </v-avatar>
          </template>
          <v-card-title>Error</v-card-title>
        </v-card-item>
        
        <v-card-text class="pt-4 text-body-1">
          {{ errorMessage }}
        </v-card-text>
        
        <v-card-actions>
          <v-spacer/>
          <v-btn
            color="primary"
            variant="tonal"
            @click="closeErrorDialog"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped lang="sass">
.quiz-header
  position: relative
  min-height: 260px
  border-radius: 0 0 30px 30px
  overflow: hidden
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1)

  &:before
    content: ''
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: rgba(0, 0, 0, 0.2)
    z-index: 0

  .quiz-header-content
    position: relative
    z-index: 1
    
    h1
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)

.score-card
  background: rgba(255, 255, 255, 0.95)
  backdrop-filter: blur(10px)
  border: 1px solid rgba(255, 255, 255, 0.3)
  
.quiz-content-container
  margin-top: -30px
  position: relative
  z-index: 2

.gap-3
  gap: 12px
</style>
