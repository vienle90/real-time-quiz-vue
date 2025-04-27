<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { categoryService } from '~/services';
import type { Category } from '~/types';

interface Props {
  reset: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  reset: false
});

const selectedCategory = ref<Category | null>(null);
const categories = ref<Category[]>([]);

const emit = defineEmits<{
  (event: 'filter-change', category: Category | null): void;
}>();

// Watch for reset prop changes to clear the filter
watch(() => props.reset, (newVal) => {
  if (newVal) {
    selectedCategory.value = null;
  }
});

// Load categories when component mounts
onMounted(async () => {
  try {
    console.log('Fetching categories...');
    categories.value = await categoryService.getCategories();
    console.log('Categories data:', categories.value);
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }
});

// Get the selected category from localStorage if exists
onMounted(() => {
  const savedCategory = localStorage.getItem('selectedCategory');
  if (savedCategory) {
    try {
      selectedCategory.value = JSON.parse(savedCategory);
    } catch {
      // If parsing fails, remove invalid data from localStorage
      localStorage.removeItem('selectedCategory');
    }
  }
});

// Update filter when selection changes
const updateFilter = (): void => {
  console.log('Selected category:', selectedCategory.value);
  
  // Save to localStorage for persistence
  if (selectedCategory.value) {
    localStorage.setItem('selectedCategory', JSON.stringify(selectedCategory.value));
  } else {
    localStorage.removeItem('selectedCategory');
  }
  
  // Emit event with category ID or null if cleared
  emit('filter-change', selectedCategory.value);
};
</script>

<template>
  <div class="category-filter">
    <v-select
      v-model="selectedCategory"
      :items="categories"
      item-title="name"
      item-value="id"
      clearable
      return-object
      variant="outlined"
      density="comfortable"
      hide-details
      @update:model-value="updateFilter"
    >
      <template #prepend-inner>
        <v-icon icon="mdi-filter-variant" class="mr-2" />
      </template>
    </v-select>
  </div>
</template>