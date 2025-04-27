<script setup>
import { computed } from 'vue';

const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
  result: {
    type: Object,
    required: true
  },
  currentQuestionIndex: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['navigateToQuestion']);

// Function to get the status class for a question
const getStatusClass = (question, index) => {
  // If this is the current question, add the current class
  if (index === props.currentQuestionIndex) {
    return 'current';
  }
  
  // If the question has been answered
  if (props.result[question.id]) {
    return props.result[question.id].isCorrect ? 'correct' : 'incorrect';
  }
  
  // Unanswered question
  return 'unanswered';
};

// Function to navigate to a specific question
const navigateToQuestion = (index) => {
  emit('navigateToQuestion', index);
};

// Computed property to determine if we need horizontal scrolling
const needsScrolling = computed(() => {
  return props.questions.length > 10;
});
</script>

<template>
  <div 
    :class="['question-status-indicator', { 'scrollable': needsScrolling }]" 
    role="navigation" 
    aria-label="Question status navigation"
  >
    <div class="indicator-container">
      <div 
        v-for="(question, index) in questions" 
        :key="index"
        :class="['question-indicator', getStatusClass(question, index)]"
        @click="navigateToQuestion(index)"
        :title="`Question ${index + 1} - ${getStatusClass(question, index) === 'correct' ? 'Correct' : 
                 getStatusClass(question, index) === 'incorrect' ? 'Incorrect' : 
                 getStatusClass(question, index) === 'current' ? 'Current' : 'Not answered yet'}`"
        role="button"
        :aria-label="`Go to question ${index + 1}`"
        :aria-current="index === currentQuestionIndex ? 'true' : 'false'"
      >
        <span>{{ index + 1 }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.question-status-indicator
  margin-bottom: 16px
  width: 100%
  
  &.scrollable
    overflow-x: auto
    padding-bottom: 8px // Add padding for scrollbar

    .indicator-container
      min-width: max-content

  .indicator-container
    display: flex
    gap: 8px
    justify-content: flex-start
    align-items: center

.question-indicator
  display: flex
  justify-content: center
  align-items: center
  width: 40px
  height: 40px
  border-radius: 50%
  font-weight: bold
  cursor: pointer
  transition: all 0.2s ease-in-out
  user-select: none
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)
  
  // Unanswered
  &.unanswered
    background-color: rgba(255, 255, 255, 0.9)
    color: rgba(var(--v-theme-on-surface), 0.7)
    border: 2px solid rgba(var(--v-theme-primary), 0.3)
    
    &:hover
      transform: translateY(-2px)
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)
      background-color: rgba(var(--v-theme-primary), 0.1)
  
  // Correct answer
  &.correct
    background-color: rgba(var(--v-theme-success), 0.1)
    color: rgba(var(--v-theme-success), 1)
    border: 2px solid rgba(var(--v-theme-success), 0.7)
    
    &:hover
      transform: translateY(-2px)
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)
      background-color: rgba(var(--v-theme-success), 0.2)
  
  // Incorrect answer
  &.incorrect
    background-color: rgba(var(--v-theme-error), 0.1)
    color: rgba(var(--v-theme-error), 1)
    border: 2px solid rgba(var(--v-theme-error), 0.7)
    
    &:hover
      transform: translateY(-2px)
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)
      background-color: rgba(var(--v-theme-error), 0.2)
  
  // Current question
  &.current
    background-color: rgba(var(--v-theme-primary), 0.1)
    color: rgba(var(--v-theme-primary), 1)
    border: 2px solid rgba(var(--v-theme-primary), 0.7)
    transform: scale(1.1)
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15)
    
    &:hover
      transform: scale(1.1) translateY(-2px)

  // For smaller screens
  @media (max-width: 600px)
    width: 36px
    height: 36px
    font-size: 14px
</style>