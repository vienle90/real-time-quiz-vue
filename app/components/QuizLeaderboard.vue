<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios';
import Pusher from 'pusher-js';
import type { QuizUser } from '~/types';

interface RankMedal {
  icon: string;
  color: string;
  text: string;
}

interface ScoreAnimation {
  active: boolean;
  direction: 'up' | 'down' | null;
}

interface LeaderboardChangedEvent {
  topUsers: QuizUser[];
}

interface Props {
  quizId: string | number;
  currentUserId: string | number | null;
}

const topUsers = ref<QuizUser[]>([]);
const isLoading = ref<boolean>(true);
const scoreAnimation = ref<Record<string | number, ScoreAnimation>>({});

const pusher = new Pusher('ab79b520a9a82017626a', {
  cluster: 'ap1'
});

const props = withDefaults(defineProps<Props>(), {
  currentUserId: null
});

// Find the current user's rank
const currentUserRank = computed((): number | null => {
  if (!props.currentUserId) return null;
  
  const index = topUsers.value.findIndex(user => user.id === props.currentUserId);
  return index !== -1 ? index + 1 : null;
});

// Get medal for rank (1st, 2nd, 3rd)
function getRankMedal(index: number): RankMedal {
  switch(index) {
    case 0: return { icon: 'mdi-medal', color: 'amber-darken-2', text: '1st' };
    case 1: return { icon: 'mdi-medal', color: 'grey-lighten-1', text: '2nd' };
    case 2: return { icon: 'mdi-medal', color: 'amber-darken-4', text: '3rd' };
    default: return { icon: 'mdi-account-outline', color: 'primary', text: `${index + 1}th` };
  }
}

// Animate score change
function animateScoreChange(userId: number | string, newScore: number, oldScore: number | undefined): void {
  if (oldScore === undefined || newScore === oldScore) return;
  
  scoreAnimation.value[userId] = {
    active: true,
    direction: newScore > oldScore ? 'up' : 'down'
  };
  
  setTimeout(() => {
    scoreAnimation.value[userId] = {
      active: false,
      direction: null
    };
  }, 1500);
}

onMounted(async () => {
  try {
    const leaderboardUrl = `${import.meta.env.VITE_API_URL}/api/quizzes/${props.quizId}/leaderboard`;
    const response = await axios.get<QuizUser[]>(leaderboardUrl);
    topUsers.value = response.data;
    
    // Initialize score animation state for each user
    topUsers.value.forEach(user => {
      scoreAnimation.value[user.id] = {
        active: false,
        direction: null
      };
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  } finally {
    isLoading.value = false;
  }

  // Subscribe to real-time updates
  const channel = pusher.subscribe(`quiz.${props.quizId}`);
  
  channel.bind('leaderboard.changed', function (data: LeaderboardChangedEvent) {
    // Store old scores to detect changes
    const oldScores: Record<string | number, number> = {};
    topUsers.value.forEach(user => {
      oldScores[user.id] = user.score;
    });
    
    // Update with new data
    topUsers.value = data.topUsers;
    
    // Animate score changes
    topUsers.value.forEach(user => {
      animateScoreChange(user.id, user.score, oldScores[user.id]);
    });
  });
});
</script>

<template>
  <v-col cols="12" md="4">
    <v-card class="leaderboard-card rounded-xl h-100">
      <v-card-item class="leaderboard-header">
        <template #prepend>
          <v-icon icon="mdi-trophy" color="amber-darken-2" size="large"/>
        </template>
        
        <v-card-title class="text-h5 font-weight-bold">
          Leaderboard
        </v-card-title>
        
        <template #append>
          <v-chip
            v-if="currentUserRank"
            color="primary"
            class="font-weight-medium"
          >
            Your Rank: {{ currentUserRank }}
          </v-chip>
        </template>
      </v-card-item>
      
      <v-divider/>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="d-flex justify-center align-center pa-8" style="min-height: 200px">
        <v-progress-circular
          size="40"
          width="4"
          color="primary"
          indeterminate
        />
      </div>
      
      <!-- Empty State -->
      <div v-else-if="topUsers.length === 0" class="d-flex flex-column align-center justify-center pa-8" style="min-height: 200px">
        <v-icon icon="mdi-account-group" color="grey-lighten-1" size="64"/>
        <div class="text-subtitle-1 text-grey mt-4 text-center">
          No participants yet.<br>Be the first to join!
        </div>
      </div>
      
      <!-- Leaderboard List -->
      <v-list v-else lines="two" class="leaderboard-list">
        <v-list-item
          v-for="(user, i) in topUsers"
          :key="user.id"
          :value="user"
          :class="[
            'leaderboard-item py-4 px-4',
            user.id === props.currentUserId ? 'current-user-item' : ''
          ]"
        >
          <!-- Rank Medal/Number -->
          <template #prepend>
            <div class="rank-indicator me-3">
              <v-tooltip :text="getRankMedal(i).text" location="left">
                <template #activator="{ props }">
                  <v-avatar 
                    v-bind="props"
                    :color="i < 3 ? getRankMedal(i).color : 'grey-lighten-3'"
                    size="40"
                    :style="i < 3 ? 'border: 2px solid white' : ''"
                    class="rank-avatar"
                  >
                    <v-icon
                      v-if="i < 3"
                      :icon="getRankMedal(i).icon"
                      color="white"
                    />
                    <span v-else class="text-subtitle-1 font-weight-bold">{{ i + 1 }}</span>
                  </v-avatar>
                </template>
              </v-tooltip>
            </div>
          </template>
          
          <!-- User Info -->
          <v-list-item-title class="text-h6 font-weight-bold mb-1">
            {{ user.username }}
            <v-icon
              v-if="user.id === props.currentUserId"
              icon="mdi-account-check"
              color="primary"
              size="small"
              class="ms-1"
            />
          </v-list-item-title>
          
          <v-list-item-subtitle class="text-caption text-medium-emphasis">
            Joined {{ user.joined_at || 'recently' }}
          </v-list-item-subtitle>
          
          <!-- Score -->
          <template #append>
            <div class="score-display">
              <div 
                class="text-h5 font-weight-bold"
                :class="{
                  'score-changed': scoreAnimation[user.id]?.active,
                  'score-increased': scoreAnimation[user.id]?.direction === 'up',
                  'score-decreased': scoreAnimation[user.id]?.direction === 'down'
                }"
              >
                {{ user.score }}
              </div>
              <div class="text-caption text-medium-emphasis text-center">points</div>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-col>
</template>

<style scoped lang="sass">
.leaderboard-card
  border: 1px solid rgba(var(--v-theme-primary), 0.1)
  display: flex
  flex-direction: column

.leaderboard-header
  background-color: rgba(var(--v-theme-primary), 0.04)

.leaderboard-list
  overflow-y: auto
  flex-grow: 1

.leaderboard-item
  border-bottom: 1px solid rgba(0, 0, 0, 0.06)
  transition: background-color 0.2s ease

  &:last-child
    border-bottom: none

  &.current-user-item
    background-color: rgba(var(--v-theme-primary), 0.05)
    position: relative

    &::before
      content: ''
      position: absolute
      left: 0
      top: 0
      bottom: 0
      width: 4px
      background-color: rgba(var(--v-theme-primary), 1)

.rank-avatar
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)

.score-display
  min-width: 80px
  display: flex
  flex-direction: column
  align-items: center

.score-changed
  transition: all 0.5s ease
  animation: pulse 1.5s ease

.score-increased
  color: rgba(var(--v-theme-success), 1)
  &::before
    content: '▲'
    position: absolute
    top: -15px
    left: 50%
    transform: translateX(-50%)
    font-size: 12px
    color: rgba(var(--v-theme-success), 1)

.score-decreased
  color: rgba(var(--v-theme-error), 1)
  &::before
    content: '▼'
    position: absolute
    top: -15px
    left: 50%
    transform: translateX(-50%)
    font-size: 12px
    color: rgba(var(--v-theme-error), 1)

@keyframes pulse
  0%
    transform: scale(1)
  50%
    transform: scale(1.1)
  100%
    transform: scale(1)
</style>