<script lang="ts" setup>
import {ref} from 'vue'
import axios from 'axios';
import QuizLeaderboard from "~/components/QuizLeaderboard.vue";
import QuizQuestion from "~/components/QuizQuestion.vue";

const route = useRoute();

const quizUser = ref({});
const dialog = ref(false);
const username = ref('');
const quizId = route.params.id;
const currentUser = ref({});


function createUser() {
  const createUserUrl = import.meta.env.VITE_API_URL + '/api/users';
  axios.post(createUserUrl, {username: username.value}).then((response) => {
    localStorage.user = JSON.stringify(response.data);
    currentUser.value = response.data;
    joinQuiz();
    dialog.value = false;
  });
}

function joinQuiz() {
  const joinQuizUrl = import.meta.env.VITE_API_URL + '/api/quizzes/' + quizId + '/users';
  axios.post(joinQuizUrl, {user_id: currentUser.value.id}).then((response) => {
    quizUser.value = response.data;
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

onMounted(() => {

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
  <v-container class="bg-surface-variant">
    <v-row no-gutters>
      <v-col>
        <v-sheet class="pa-2 ma-2">
          <v-card
              class="mx-auto"
              max-width="300"
          >
            <v-card-title>Quiz Title</v-card-title>
            <v-card-text>Quiz Description</v-card-text>
          </v-card>
        </v-sheet>
      </v-col>
      <v-col>
        <v-sheet class="pa-2 ma-2">
          <v-card
              class="mx-auto"
              max-width="300"
          >
            <v-card-title>Username: {{ currentUser?.username }}</v-card-title>
            <v-card-text>Score: {{ quizUser?.score }}</v-card-text>
          </v-card>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <QuizQuestion v-if="currentUser.id !== undefined" @score-changed="updateScore" :quiz-id="quizId" :user-id="currentUser.id"/>
      <QuizLeaderboard :quiz-id="quizId"/>
    </v-row>

    <v-dialog
        v-model="dialog"
        width="auto"
    >
      <v-card
          max-width="600"
      >
        <v-card-title>Enter you name to join this quiz</v-card-title>
        <v-form class="pa-2 ma-2" @submit.prevent>
          <v-text-field
              v-model="username"
              label="Your name"
              width="300"
          />
          <v-btn class="mt-2" type="button" block @click="createUser">Submit</v-btn>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

