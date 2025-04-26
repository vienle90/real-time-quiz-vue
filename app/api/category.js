export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiBaseUrl = process.server 
    ? config.apiBaseUrl 
    : config.public.apiBaseUrl || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${apiBaseUrl}/api/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
});