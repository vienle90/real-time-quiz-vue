<script setup lang="ts">
const appTitle = "QuizMaster";

// For smooth scrolling to quiz section when clicking on 'Explore' button
const scrollToQuizzes = () => {
  const quizzesSection = document.getElementById('quizzes-section');
  if (quizzesSection) {
    quizzesSection.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<template>
  <v-app-bar
    app
    color="primary"
    elevation="1"
    height="68"
    class="px-3"
  >
    <v-app-bar-title class="text-h5 font-weight-bold">
      <router-link to="/" class="d-flex align-center text-decoration-none text-white">
        <v-icon icon="mdi-help-box" size="large" class="me-2" />
        {{ appTitle }}
      </router-link>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Navigation links with hover effect -->
    <div class="d-none d-md-flex">
      <v-btn
        variant="text"
        class="nav-link mx-1 text-none text-subtitle-1"
        @click="scrollToQuizzes"
      >
        <v-icon icon="mdi-view-dashboard" class="me-1" size="small" />
        Explore
      </v-btn>
      
      <v-btn
        to="/"
        variant="text"
        class="nav-link mx-1 text-none text-subtitle-1"
      >
        <v-icon icon="mdi-trophy" class="me-1" size="small" />
        Leaderboard
      </v-btn>
      
      <v-btn
        to="/"
        variant="text"
        class="nav-link mx-1 text-none text-subtitle-1"
      >
        <v-icon icon="mdi-account" class="me-1" size="small" />
        Profile
      </v-btn>
    </div>

    <!-- Mobile menu button -->
    <v-app-bar-nav-icon
      class="d-flex d-md-none"
      @click.stop="$emit('toggle-drawer')"
    ></v-app-bar-nav-icon>

    <!-- Action button -->
    <v-btn
      color="accent"
      variant="elevated"
      class="ml-4 rounded-lg text-none text-subtitle-2 d-none d-sm-flex font-weight-bold"
      prepend-icon="mdi-play-circle"
    >
      Start Quiz
    </v-btn>
  </v-app-bar>

  <!-- Mobile navigation drawer -->
  <slot name="navigation-drawer"></slot>
</template>

<style scoped lang="sass">
.nav-link
  position: relative
  transition: all 0.3s ease

  &:hover
    background-color: rgba(255, 255, 255, 0.1)
    transform: translateY(-2px)

  &:after
    content: ''
    position: absolute
    bottom: 0
    left: 50%
    width: 0
    height: 2px
    background-color: var(--v-accent-base)
    transition: all 0.3s ease
    transform: translateX(-50%)

  &:hover:after
    width: 70%
</style>