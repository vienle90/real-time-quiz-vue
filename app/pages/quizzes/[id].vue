<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import QuizLeaderboard from "~/components/QuizLeaderboard.vue";
import QuizQuestion from "~/components/QuizQuestion.vue";

const route = useRoute();

const quiz = ref({});
const quizUser = ref({});
const dialog = ref(false);
const username = ref('');
const quizId = route.params.id;
const currentUser = ref({});
const isLoading = ref(true);

// For animation
const showContent = ref(false);

// Form validation
const usernameRules = [
  v => !!v || 'Username is required',
  v => (v && v.length >= 3) || 'Username must be at least 3 characters',
];
const formValid = ref(false);

// Get quiz details
function fetchQuizDetails() {
  const quizUrl = import.meta.env.VITE_API_URL + '/api/quizzes/' + quizId;
  axios.get(quizUrl).then((response) => {
    quiz.value = response.data;
    setTimeout(() => {
      showContent.value = true;
      isLoading.value = false;
    }, 300);
  }).catch((error) => {
    console.error('Error fetching quiz details:', error);
    isLoading.value = false;
  });
}

function createUser() {
  if (!formValid.value) return;
  
  const createUserUrl = import.meta.env.VITE_API_URL + '/api/users';
  axios.post(createUserUrl, {username: username.value}).then((response) => {
    localStorage.user = JSON.stringify(response.data);
    currentUser.value = response.data;
    joinQuiz();
    dialog.value = false;
  }).catch((error) => {
    console.error('Error creating user:', error);
  });
}

function joinQuiz() {
  const joinQuizUrl = import.meta.env.VITE_API_URL + '/api/quizzes/' + quizId + '/users';
  axios.post(joinQuizUrl, {user_id: currentUser.value.id}).then((response) => {
    quizUser.value = response.data;
  }).catch((error) => {
    console.error('Error joining quiz:', error);
  });
}

function getQuizUser() {
  const getQuizUserUrl = import.meta.env.VITE_API_URL + '/api/quizzes/' + quizId + '/users/' + currentUser.value.id;
  axios.get(getQuizUserUrl).then((response) => {
    quizUser.value = response.data;
  }).catch(() => {
    joinQuiz();
  });
}

function updateScore(score) {
  quizUser.value.score += score;
}

// Random color for the quiz background
const quizBgGradient = computed(() => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    'linear-gradient(135deg, #f83600 0%, #f9d423 100%)',
    'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
    'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)'
  ];
  
  return gradients[Math.floor(Math.random() * gradients.length)];
});

onMounted(() => {
  fetchQuizDetails();

  const localStorageUser = localStorage.user;

  if (localStorageUser === undefined) {
    dialog.value = true;
  } else {
    currentUser.value = JSON.parse(localStorageUser);
    getQuizUser();
  }
});
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
                <h1 class="text-h3 font-weight-bold mb-2">{{ quiz.title }}</h1>
                <p class="text-h6 mb-6 text-medium-emphasis text-white">{{ quiz.description }}</p>
                
                <div class="d-flex flex-wrap gap-3">
                  <v-chip size="large" color="white" variant="elevated" class="font-weight-medium">
                    <v-icon start icon="mdi-help-circle" color="primary"></v-icon>
                    <span class="text-primary">{{ quiz.questions_count || '10' }} Questions</span>
                  </v-chip>
                  
                  <v-chip size="large" color="white" variant="elevated" class="font-weight-medium">
                    <v-icon start icon="mdi-account-group" color="primary"></v-icon>
                    <span class="text-primary">{{ quiz.participants_count || '25' }} Participants</span>
                  </v-chip>
                </div>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-card class="score-card elevation-10 rounded-xl" v-if="currentUser.id !== undefined">
                  <v-card-item class="pb-0">
                    <template v-slot:prepend>
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
            v-if="currentUser.id !== undefined" 
            @score-changed="updateScore" 
            :quiz-id="quizId" 
            :user-id="currentUser.id"
          />
          <QuizLeaderboard :quiz-id="quizId" :current-user-id="currentUser.id"/>
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
          <template v-slot:prepend>
            <v-avatar color="primary" size="48">
              <v-icon icon="mdi-account" color="white"></v-icon>
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
              :disabled="!formValid"
              @click="createUser"
            >
              <v-icon start icon="mdi-login"></v-icon>
              Join Quiz
            </v-btn>
          </v-form>
        </v-card-text>
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