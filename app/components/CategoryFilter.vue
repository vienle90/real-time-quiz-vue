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
      <template v-slot:prepend-inner>
        <v-icon icon="mdi-filter-variant" class="mr-2" />
      </template>
    </v-select>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  reset: {
    type: Boolean,
    default: false
  }
});

const selectedCategory = ref(null);
const categories = ref([]);

const emit = defineEmits(['filter-change']);

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
    const response = await axios.get('http://localhost:8000/api/categories');
    console.log('Categories data:', response.data);
    categories.value = response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
});

// Get the selected category from localStorage if exists
onMounted(() => {
  const savedCategory = localStorage.getItem('selectedCategory');
  if (savedCategory) {
    try {
      selectedCategory.value = JSON.parse(savedCategory);
    } catch (e) {
      localStorage.removeItem('selectedCategory');
    }
  }
});

// Update filter when selection changes
const updateFilter = () => {
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