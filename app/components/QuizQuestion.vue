<script setup>
import {ref} from 'vue'
import axios from 'axios';

// eslint-disable-next-line vue/require-prop-types
const props = defineProps(['quizId', 'userId']);

const questions = ref([]);
const answers = ref({});
const result = ref({});


const emit = defineEmits(['scoreChanged']);

function submitAnswers(questionId) {
  if (result.value[questionId] !== undefined) {
    return;
  }
  const submitAnswersUrl = import.meta.env.VITE_API_URL + '/api/quizzes/' + props.quizId + '/questions/' + questionId + '/answers';
  axios.post(submitAnswersUrl, {choice_id: answers.value[questionId], user_id: props.userId}).then((response) => {
    const choiceId = response.data.choice_id;
    const isCorrect = response.data.is_correct;
    result.value[questionId] = {choiceId: choiceId, isCorrect: isCorrect};
    emit('scoreChanged', response.data.score);
  });
}

onMounted(() => {
  const getQuestionUrl = import.meta.env.VITE_API_URL + '/api/quizzes/' + props.quizId + '/questions';
  axios.get(getQuestionUrl).then((response) => {
    questions.value = response.data
  });

  const resultKey = 'result.' + props.quizId + 'user.' + props.userId;
  const localStorageResult = localStorage.getItem(resultKey);
  if (localStorageResult !== null) {
    result.value = JSON.parse(localStorageResult);
  }
});

watch(result.value, (newResult) => {
  const key = 'result.' + props.quizId + 'user.' + props.userId;
  localStorage.setItem(key, JSON.stringify(newResult));
});

</script>

<template>
  <v-col cols="8">
    <v-sheet class="pa-2 ma-2">
      <v-carousel
          height="500"
          progress="primary"
          hide-delimiters
      >
        <v-carousel-item
            v-for="(question, i) in questions"
            :key="i"
        >
          <v-sheet
              height="100%"
          >
            <v-card class="pa-10 ma-10">
              <v-card-title>
                {{ question.question }}
              </v-card-title>

              <v-card-text v-for="choice in question.choices">
                <div v-if="result[question.id] === undefined">
                  <input :id="choice.id" v-model="answers[question.id]" type="radio" :value="choice.id" @change="submitAnswers(question.id)">
                  <label :for="choice.id">{{ choice.choice }}</label>
                </div>
                <div v-else-if="result[question.id].choiceId === choice.id && result[question.id].isCorrect === true">
                  <input :id="choice.id" v-model="answers[question.id]" type="radio" :value="choice.id" checked="checked" disabled="disabled">
                  <label :for="choice.id" style="color: green">{{ choice.choice }}</label>
                </div>
                <div v-else-if="result[question.id].choiceId === choice.id && result[question.id].isCorrect === false">
                  <input :id="choice.id" v-model="answers[question.id]" type="radio" :value="choice.id" checked="checked" disabled="disabled">
                  <label :for="choice.id" style="color: red">{{ choice.choice }}</label>
                </div>
                <div v-else>
                  <input :id="choice.id" v-model="answers[question.id]" type="radio" :value="choice.id" disabled="disabled">
                  <label :for="choice.id">{{ choice.choice }}</label>
                </div>
              </v-card-text>
            </v-card>
          </v-sheet>
        </v-carousel-item>
      </v-carousel>
    </v-sheet>
  </v-col>
</template>
<style scoped>
label {
  margin-left: 10px;
  font-size: 1.25rem;
}
input {
  margin-right: 10px;
  font-size: 1.25rem;
}
</style>