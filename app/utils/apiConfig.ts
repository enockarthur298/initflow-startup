// Determine the backend URL based on the environment
const getBackendUrl = () => {
  // In production, use the same domain as the frontend
  if (process.env.NODE_ENV === 'production') {
    return ''; // Empty string will make requests relative to the current domain
  }
  // In development, use the local Flask server
  return process.env.PYTHON_BACKEND_URL || 'http://localhost:5000';
};

export const BACKEND_URL = getBackendUrl();

// Helper function to make authenticated requests to the backend
export const backendFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`;
  
  // Add any default headers here (like auth tokens)
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        typeof errorData === 'object' && errorData !== null && 'message' in errorData
          ? String(errorData.message)
          : 'API request failed'
      );
    }

    return await response.json();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'An unknown error occurred';
        
    console.error('API request failed:', errorMessage);
    throw new Error(`API request failed: ${errorMessage}`);
  }
};
