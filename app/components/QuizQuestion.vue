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
  console.log(result.value);
  const choiceId = answers.value[questionId];
  if (result.value[choiceId] !== undefined) {
    return;
  }
  const submitAnswersUrl = import.meta.env.VITE_API_URL + '/api/quizzes/' + props.quizId + '/questions/' + questionId + '/answers';
  axios.post(submitAnswersUrl, {choice_id: answers.value[questionId], user_id: props.userId}).then((response) => {
    const choiceId = response.data.choice_id;
    result.value[choiceId] = response.data.correct;
    emit('scoreChanged', response.data.score);
  });
}

onMounted(() => {
  const getQuestionUrl = import.meta.env.VITE_API_URL + '/api/quizzes/' + props.quizId + '/questions';
  axios.get(getQuestionUrl).then((response) => {
    questions.value = response.data
  });

  const key = 'result.' + props.quizId + '_user.' + props.userId;
  const localStorageResult = localStorage.getItem(key);
  if (localStorageResult !== null) {
    result.value = JSON.parse(localStorageResult);
  }

  console.log(result.value);

});

watch(result.value, (newResult) => {
  console.log(newResult);
  const key = 'result.' + props.quizId + '_user.' + props.userId;
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

              <v-card-text>
                <v-radio-group
                    v-for="choice in question.choices" v-model="answers[question.id]" @change="submitAnswers(question.id)">
                  <v-radio
                      v-if="result[choice.id] === undefined" :key="choice.id" :label="choice.choice" :value="choice.id"/>
                  <v-radio
                      v-else-if="result[choice.id] === true" :label="choice.choice" :value="choice.id" color="success" readonly/>
                  <v-radio
                      v-else :label="choice.choice" :value="choice.id" color="error" readonly/>
                </v-radio-group>
              </v-card-text>
            </v-card>
          </v-sheet>
        </v-carousel-item>
      </v-carousel>
    </v-sheet>
  </v-col>
</template>