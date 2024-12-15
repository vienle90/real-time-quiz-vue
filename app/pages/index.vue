<script lang="ts" setup>
import { ref } from 'vue'
import axios from 'axios';

const users = ref([])
onMounted(() => {
  // Fetch data from this api using Axios 'http://localhost:8000/user-scores'
  // Assign the response to the users ref
  // add header 'Access-Control-Allow-Origin': '*' before the get request
  axios.get('http://localhost:8000/api/user-scores').then((response) => {
    users.value = response.data
  })
})
</script>

<template>
  <v-container class="bg-surface-variant">
    <v-row no-gutters>
      <v-col>
        <v-sheet class="pa-2 ma-2">
          quiz goes here
        </v-sheet>
      </v-col>
      <v-col cols="4">
        <v-sheet class="pa-2 ma-2">
          <v-card
              class="mx-auto"
              max-width="300"
          >
            <v-list density="compact">
              <v-list-subheader>Leaderboard</v-list-subheader>

              <v-divider/>
              <v-list-item
                  v-for="(item, i) in users"
                  :key="i"
                  :value="item"
                  color="primary"
              >
                <v-list-item-title>{{item.username}}</v-list-item-title>
                <template #prepend>
                  <v-btn
                      color="grey-lighten-1"
                      variant="text"
                  >{{item.score}}</v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

