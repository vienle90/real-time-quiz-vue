<script setup lang="ts">
import { ref } from 'vue';

const navigationDrawer = ref(false);

const toggleDrawer = () => {
  navigationDrawer.value = !navigationDrawer.value;
};
</script>

<template>
  <v-app>
    <!-- Header -->
    <AppHeader @toggle-drawer="toggleDrawer">
      <template #navigation-drawer>
        <v-navigation-drawer
          v-model="navigationDrawer"
          temporary
          location="right"
        >
          <v-list>
            <v-list-item
              prepend-icon="mdi-view-dashboard"
              title="Explore Quizzes"
              to="/"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-trophy"
              title="Leaderboard"
              to="/"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-account"
              title="Profile"
              to="/"
            ></v-list-item>
            <v-divider class="my-2"></v-divider>
            <v-list-item
              prepend-icon="mdi-play-circle"
              title="Start Quiz"
              to="/"
              color="primary"
            ></v-list-item>
          </v-list>
        </v-navigation-drawer>
      </template>
    </AppHeader>

    <!-- Main content -->
    <v-main>
      <slot />
    </v-main>

    <!-- Footer -->
    <AppFooter />
  </v-app>
</template>