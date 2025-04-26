export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  
  // Build query string with filters
  const params = new URLSearchParams();
  
  if (query.category_id) {
    params.append('category_id', query.category_id);
  }
  
  if (query.difficulty) {
    params.append('difficulty', query.difficulty);
  }
  
  if (query.is_featured) {
    params.append('is_featured', query.is_featured);
  }
  
  // Construct URL with query parameters
  const queryString = params.toString();
  const url = queryString 
    ? `${config.public.apiBaseUrl}/api/quizzes?${queryString}`
    : `${config.public.apiBaseUrl}/api/quizzes`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
});