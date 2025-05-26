import { json, type LoaderFunction } from '@remix-run/cloudflare';
import { BACKEND_URL } from '~/utils/apiConfig';

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
    return json(
      { error: "User ID is required", has_active_subscription: false }, 
      { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
  
  try {
    console.log(`Checking subscription for user: ${userId}`);
    
    const response = await fetch(`${BACKEND_URL}/api/check-subscription?user_id=${userId}`, {
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
      }, { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    
    // If we get here, the response is ok
    const responseData = await response.json();
    return json(responseData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error) {
    console.error('Error checking subscription:', error);
    
    // Always return a successful response with has_active_subscription: false
    return json({
      error: "Error checking subscription status",
      has_active_subscription: false,
      subscriptions: []
    }, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
};