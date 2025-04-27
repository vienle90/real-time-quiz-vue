<script setup>
defineProps({
  quiz: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <v-card
    class="quiz-card h-100"
    :to="`/quizzes/${quiz.slug || quiz.id}`"
    hover
    variant="elevated"
    rounded="lg"
  >
    <v-card-item class="pb-0">
      <div class="d-flex align-center">
        <v-chip
          :color="quiz.difficulty?.color || 'primary'"
          size="small"
          class="font-weight-medium text-uppercase me-2"
        >
          {{ quiz.difficulty?.label || 'Medium' }}
        </v-chip>
        
        <!-- Display quiz category -->
        <v-chip
          v-if="quiz.category"
          size="small"
          color="primary"
          variant="outlined"
          class="font-weight-medium"
        >
          {{ quiz.category.name }}
        </v-chip>
      </div>
    </v-card-item>
    
    <v-card-item>
      <v-card-title class="font-weight-bold">{{ quiz.title }}</v-card-title>
      <v-card-subtitle class="text-medium-emphasis pt-2">
        {{ quiz.description }}
      </v-card-subtitle>
    </v-card-item>

    <v-card-actions class="py-3 px-4">
      <v-row align="center" no-gutters>
        <v-col>
          <div class="d-flex align-center">
            <v-icon icon="mdi-help-circle-outline" size="small" color="primary" class="me-1"></v-icon>
            <span class="text-body-2">{{ quiz.questions_count || '10' }} Questions</span>
          </div>
        </v-col>
        <v-col class="text-right">
          <v-btn
            variant="tonal"
            color="primary"
            density="comfortable"
            prepend-icon="mdi-play-circle"
          >
            Start Quiz
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.quiz-card {
  transition: transform 0.3s ease;
}
.quiz-card:hover {
  transform: translateY(-5px);
}
</style>