<script lang="ts" setup>
import {ref} from 'vue'
import axios from 'axios';

const quizzes = ref([]);

onMounted(() => {
  const url = import.meta.env.VITE_API_URL + '/api/quizzes';
  axios.get(url).then((response) => {
    quizzes.value = response.data
  });
})
</script>

<template>
  <v-container
      class="bg-surface-variant mb-6"
  >
    <v-row
        align="start"
        no-gutters
    >
      <v-col
          v-for="(quiz) in quizzes"
          cols="4"
      >
        <v-sheet class="pa-2 ma-2">
          <v-card
              class="mx-auto"
              height="150"
          >
            <v-card-title>
              <nuxt-link :to="{ name: 'quizzes-id', params: { id: quiz.id }}"> {{ quiz.title }} </nuxt-link>
            </v-card-title>
            <v-card-text>{{ quiz.description }}</v-card-text>
          </v-card>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

