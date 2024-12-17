<script setup>
import {ref} from 'vue'
import axios from 'axios';
import Pusher from 'pusher-js';

const topUsers = ref([]);
const pusher = new Pusher('ab79b520a9a82017626a', {
  cluster: 'ap1'
});

const props = defineProps(['quizId']);

onMounted(() => {
  const leaderboardUrl = import.meta.env.VITE_API_URL + '/api/quizzes/' + props.quizId + '/leaderboard';
  axios.get(leaderboardUrl).then((response) => {
    topUsers.value = response.data
  });

  const channel = pusher.subscribe('quiz.'+ props.quizId);
  channel.bind('leaderboard.changed', function (data) {
    topUsers.value = data.topUsers;
  });
});

</script>
<template>
  <v-col cols="4">
    <v-sheet class="pa-2 ma-2">
      <v-card
          class="mx-auto"
          max-width="300"
      >
        <v-list density="compact">
          <v-card-title>Leaderboard</v-card-title>
          <v-list-item
              v-for="(item, i) in topUsers"
              :key="i"
              :value="item"
              color="primary"
          >
            <v-list-item-title>{{ item.username }}</v-list-item-title>
            <template #prepend>
              <v-btn
                  color="success"
                  variant="text"
              >{{ item.score }}
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-sheet>
  </v-col>
</template>