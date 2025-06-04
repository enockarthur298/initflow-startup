import { json, type LoaderFunction } from '@remix-run/cloudflare';

// This is a Remix route that handles GET requests to /api/check-subscription
// It checks if a user has an active subscription by forwarding the request to the Python backend

// Define the response type for better type safety
interface SubscriptionResponse {
  has_active_subscription: boolean;
  error?: string;
  subscriptions?: Array<{
    id: string;
    status: string;
    [key: string]: any;
  }>;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');
  
  if (!userId) {
    return json({ error: "User ID is required", has_active_subscription: false }, { status: 400 });
  }
  
  try {
    // Forward the request to your Python backend
    // In a production environment, you might want to use environment variables
    // For development, default to localhost:5000 if the env var is not set
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'https://backend.initflow.online';
    
    console.log(`Checking subscription for user: ${userId}`);
    console.log(`Forwarding to: ${pythonBackendUrl}/api/check-subscription`);
    
    try {
      const response = await fetch(`${pythonBackendUrl}/api/check-subscription?user_id=${userId}`, {
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!response.ok) {
        console.error(`Subscription check failed: ${response.statusText}`);
        // Return a successful response with has_active_subscription: false
        return json({ 
          error: `Subscription check failed: ${response.statusText}`,
          has_active_subscription: false,
          subscriptions: []
        }, { status: 200 });
      }
      
      const data = await response.json();
      return json(data);
    } catch (fetchError) {
      console.error('Network error checking subscription:', fetchError);
      // Return a successful response with has_active_subscription: false
      return json({
        error: "Network error checking subscription",
        has_active_subscription: false,
        subscriptions: []
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error checking subscription:', error);
    
    // Always return a successful response with has_active_subscription: false
    return json({
      error: "Error checking subscription status",
      has_active_subscription: false,
      subscriptions: []
    }, { status: 200 });
  }
};