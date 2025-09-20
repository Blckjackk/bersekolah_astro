import type { APIRoute } from 'astro';

// Get environment URLs consistently  
const getApiBaseUrl = () => {
  const isProduction = import.meta.env.PROD;
  return isProduction 
    ? 'https://sandybrown-capybara-903436.hostingersite.com/api'
    : import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
};

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  
  if (!id) {
    return new Response(JSON.stringify({ 
      error: 'Article ID is required' 
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  
  const apiBaseUrl = getApiBaseUrl();
  const backendUrl = `${apiBaseUrl}/konten/${id}`;
  
  console.log('Fetching article from:', backendUrl);
  
  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch article', 
        status: response.status 
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const data = await response.json();
    console.log('Backend API response for article:', data);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return new Response(JSON.stringify({ 
      error: 'Network error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};