<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import QuestionStatusIndicator from './QuestionStatusIndicator.vue';
import { questionService } from '~/services';
import type { Question, QuestionResult } from '~/types';

interface Props {
  quizId: string | number;
  userId: string | number;
}

const props = defineProps<Props>();

const questions = ref<Question[]>([]);
const result = ref<QuestionResult>({});
const isLoading = ref<boolean>(true);
const currentQuestionIndex = ref<number>(0);

const emit = defineEmits<{
  (event: 'scoreChanged', score: number): void;
}>();

// For animation
const questionTransition = ref<boolean>(true);

// Calculate progress percentage
const progressPercentage = computed((): number => {
  if (!questions.value.length) return 0;
  return (Object.keys(result.value).length / questions.value.length) * 100;
});

// Check if a question has been answered
const isQuestionAnswered = (questionId: number | string): boolean => {
  return result.value[questionId] !== undefined;
};

// Get the number of answered questions
const answeredCount = computed((): number => {
  return Object.keys(result.value).length;
});

// Get the number of correct answers
const correctCount = computed((): number => {
  let count = 0;
  for (const questionId in result.value) {
    if (result.value[questionId]?.isCorrect) {
      count++;
    }
  }
  return count;
});

// Submit answer for a question
async function submitAnswers(questionId: number | string, choiceId: number): Promise<void> {
  if (result.value[questionId] !== undefined) {
    return;
  }
  
  try {
    const response = await questionService.submitAnswer(
      props.quizId,
      questionId,
      props.userId,
      choiceId
    );
    
    const responseChoiceId = response.choice_id;
    const isCorrect = response.is_correct;
    
    // Update results
    result.value[questionId] = {
      choiceId: responseChoiceId, 
      isCorrect: isCorrect
    };
    
    // Emit score change
    emit('scoreChanged', response.score);
    
    // Auto advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex.value < questions.value.length - 1) {
        goToNextQuestion();
      }
    }, 1500);
  } catch (error) {
    console.error('Error submitting answer:', error);
  }
}

// Navigation functions
function goToNextQuestion(): void {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    questionTransition.value = false;
    setTimeout(() => {
      currentQuestionIndex.value++;
      questionTransition.value = true;
    }, 300);
  }
}

function goToPreviousQuestion(): void {
  if (currentQuestionIndex.value > 0) {
    questionTransition.value = false;
    setTimeout(() => {
      currentQuestionIndex.value--;
      questionTransition.value = true;
    }, 300);
  }
}

// Navigate to a specific question when clicking on a question indicator
function navigateToQuestion(index: number): void {
  if (index !== currentQuestionIndex.value) {
    questionTransition.value = false;
    setTimeout(() => {
      currentQuestionIndex.value = index;
      questionTransition.value = true;
    }, 300);
  }
}

// Get class for choice
function getChoiceClass(questionId: number | string, choiceId: number): string {
  if (!result.value[questionId]) return '';
  
  const isSelected = result.value[questionId].choiceId === choiceId;
  const isCorrect = result.value[questionId].isCorrect;
  
  if (isSelected && isCorrect) return 'choice-correct';
  if (isSelected && !isCorrect) return 'choice-incorrect';
  
  return '';
}

// Load questions from API
onMounted(async (): Promise<void> => {
  try {
    questions.value = await questionService.getQuizQuestions(props.quizId);
    
    // Load saved results from localStorage
    const resultKey = `result.${props.quizId}user.${props.userId}`;
    const localStorageResult = localStorage.getItem(resultKey);
    
    if (localStorageResult !== null) {
      result.value = JSON.parse(localStorageResult);
      
      // If user has already answered some questions, start at the first unanswered one
      if (Object.keys(result.value).length > 0 && Object.keys(result.value).length < questions.value.length) {
        for (let i = 0; i < questions.value.length; i++) {
          const questionId = questions.value[i]?.id;
          if (questionId !== undefined && !result.value[questionId]) {
            currentQuestionIndex.value = i;
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
  } finally {
    isLoading.value = false;
  }
});

// Save results to localStorage when they change
watch(() => result.value, (newResult: QuestionResult) => {
  const key = `result.${props.quizId}user.${props.userId}`;
  localStorage.setItem(key, JSON.stringify(newResult));
}, { deep: true });
</script>

<template>
  <v-col cols="12" md="8">
    <v-card class="quiz-question-card rounded-xl">
      <!-- Loading State -->
      <div v-if="isLoading" class="d-flex justify-center align-center pa-8" style="min-height: 400px">
        <v-progress-circular
          size="50"
          width="5"
          color="primary"
          indeterminate
        />
      </div>
      
      <template v-else>
        <!-- Progress Header -->
        <v-card-item class="progress-header">
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="text-subtitle-1 font-weight-medium">
              Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
            </div>
            
            <div class="progress-stats d-flex align-center">
              <v-tooltip location="bottom" text="Correct answers">
                <template #activator="{ props }">
                  <div class="d-flex align-center me-3" v-bind="props">
                    <v-icon icon="mdi-check-circle" color="success" class="me-1"/>
                    <span>{{ correctCount }}</span>
                  </div>
                </template>
              </v-tooltip>
              
              <v-tooltip location="bottom" text="Progress">
                <template #activator="{ props }">
                  <div class="d-flex align-center" v-bind="props">
                    <v-icon icon="mdi-progress-check" color="info" class="me-1"/>
                    <span>{{ answeredCount }}/{{ questions.length }}</span>
                  </div>
                </template>
              </v-tooltip>
            </div>
          </div>
          
          <v-progress-linear
            v-model="progressPercentage"
            height="8"
            color="primary"
            rounded
            class="mb-4"
          />
        </v-card-item>
        
        <!-- Question Status Indicator -->
        <v-card-item class="px-4 pb-0 pt-2">
          <QuestionStatusIndicator
            :questions="questions"
            :result="result"
            :current-question-index="currentQuestionIndex"
            @navigate-to-question="navigateToQuestion"
          />
        </v-card-item>
        
        <!-- Question Content -->
        <v-window v-model="currentQuestionIndex">
          <v-window-item
            v-for="(question, i) in questions"
            :key="i"
            :value="i"
          >
            <v-card-item>
              <v-fade-transition>
                <div v-if="questionTransition" class="question-content px-4">
                  <h2 class="text-h4 font-weight-bold mb-6 question-text">
                    {{ question.question }}
                  </h2>
                  
                  <v-divider class="mb-6"/>
                  
                  <!-- Answer Choices -->
                  <div class="choices-container">
                    <v-hover v-for="choice in question.choices" :key="choice.id" v-slot="{ isHovering, props }">
                      <v-card
                        v-bind="props"
                        :class="[
                          'choice-card mb-4 pa-4',
                          getChoiceClass(question.id, choice.id),
                          isHovering && !isQuestionAnswered(question.id) ? 'choice-hover' : '',
                          isQuestionAnswered(question.id) ? 'choice-answered' : ''
                        ]"
                        :disabled="isQuestionAnswered(question.id)"
                        variant="outlined"
                        :ripple="!isQuestionAnswered(question.id)"
                        @click="!isQuestionAnswered(question.id) && submitAnswers(question.id, choice.id)"
                      >
                        <div class="d-flex align-center">
                          <div class="choice-indicator me-4">
                            <v-icon
                              v-if="isQuestionAnswered(question.id) && result[question.id]?.choiceId === choice.id && result[question.id]?.isCorrect"
                              icon="mdi-check-circle"
                              color="success"
                              size="large"
                            />
                            
                            <v-icon
                              v-else-if="isQuestionAnswered(question.id) && result[question.id]?.choiceId === choice.id && !result[question.id]?.isCorrect"
                              icon="mdi-close-circle"
                              color="error"
                              size="large"
                            />
                            
                            <div v-else class="choice-letter">
                              {{ String.fromCharCode(65 + question.choices.indexOf(choice)) }}
                            </div>
                          </div>
                          
                          <div class="choice-text text-h6">
                            {{ choice.choice }}
                          </div>
                        </div>
                      </v-card>
                    </v-hover>
                  </div>
                </div>
              </v-fade-transition>
            </v-card-item>
          </v-window-item>
        </v-window>
        
        <!-- Navigation Controls -->
        <v-card-actions class="pa-4">
          <v-btn
            color="secondary"
            variant="text"
            :disabled="currentQuestionIndex === 0"
            prepend-icon="mdi-arrow-left"
            @click="goToPreviousQuestion"
          >
            Previous
          </v-btn>
          
          <v-spacer/>
          
          <v-btn
            color="primary"
            variant="text"
            :disabled="currentQuestionIndex === questions.length - 1"
            append-icon="mdi-arrow-right"
            @click="goToNextQuestion"
          >
            Next
          </v-btn>
        </v-card-actions>
      </template>
    </v-card>
  </v-col>
</template>

<style scoped lang="sass">
.quiz-question-card
  overflow: hidden
  border: 1px solid rgba(var(--v-theme-primary), 0.1)
  min-height: 500px
  display: flex
  flex-direction: column

.progress-header
  background-color: rgba(var(--v-theme-primary), 0.04)

.question-content
  min-height: 380px
  display: flex
  flex-direction: column

.question-text
  line-height: 1.4
  color: rgba(var(--v-theme-on-surface), 0.87)

.choices-container
  flex-grow: 1
  display: flex
  flex-direction: column
  justify-content: flex-start

.choice-card
  cursor: pointer
  transition: all 0.2s ease-in-out
  border: 2px solid transparent
  position: relative

  &.choice-hover
    transform: translateY(-2px)
    border-color: rgba(var(--v-theme-primary), 0.5)
    background-color: rgba(var(--v-theme-primary), 0.03)

  &.choice-correct
    background-color: rgba(var(--v-theme-success), 0.1)
    border-color: rgba(var(--v-theme-success), 0.7)

  &.choice-incorrect
    background-color: rgba(var(--v-theme-error), 0.1)
    border-color: rgba(var(--v-theme-error), 0.7)

  &.choice-answered
    cursor: default

.choice-indicator
  display: flex
  align-items: center
  justify-content: center
  min-width: 36px
  height: 36px

  .choice-letter
    display: flex
    align-items: center
    justify-content: center
    width: 36px
    height: 36px
    border-radius: 50%
    background-color: rgba(var(--v-theme-primary), 0.1)
    color: rgba(var(--v-theme-primary), 1)
    font-weight: bold
    font-size: 16px

.choice-text
  font-weight: 500
  flex-grow: 1
</style>