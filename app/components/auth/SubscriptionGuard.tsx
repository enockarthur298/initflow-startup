import { useEffect, useState } from 'react';
import { useFetcher, Link } from '@remix-run/react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@clerk/remix';
import { motion } from 'framer-motion';

interface SubscriptionResponse {
  has_active_subscription: boolean;
  error?: string;
  subscriptions?: Array<{
    id: string;
    status: string;
    [key: string]: any;
  }>;
}

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { isLoaded: isAuthLoaded, isSignedIn, userId } = useAuth();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const subscriptionFetcher = useFetcher();

  // Check subscription status when user signs in
  useEffect(() => {
    let mounted = true;
    
    const checkAndHandleSubscription = async () => {
      if (isAuthLoaded && isSignedIn && userId) {
        try {
          await checkSubscriptionStatus();
        } catch (error) {
          console.error('Error in subscription check:', error);
          setShowSubscriptionDialog(false);
        }
      }
    };
    
    if (mounted) {
      checkAndHandleSubscription();
    }
    
    return () => {
      mounted = false;
    };
  }, [isAuthLoaded, isSignedIn, userId]);

  const checkSubscriptionStatus = async () => {
    if (!userId) return false;
    
    setIsCheckingSubscription(true);
    try {
      // Use forward slashes in the URL
      const response = await fetch(`/api/check-subscription?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as SubscriptionResponse;
      
      if (data.has_active_subscription === false) {
        setShowSubscriptionDialog(true);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking subscription:', error);
      // If there's an error, we'll still let them use the app
      return true;
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const handleUpgradeClick = () => {
    window.location.href = '/pricing';
  };

  const handleMaybeLater = () => {
    setShowSubscriptionDialog(false);
  };

  // Only show loading state if we're still checking auth or subscription
  if (!isAuthLoaded || (isCheckingSubscription && isSignedIn)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-[1000] pointer-events-none">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      
      <Dialog.Root open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog} modal={true}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000]" />
          <Dialog.Content 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl z-[1001] border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[90vh] flex flex-col md:flex-row"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            {/* Left Side - App Demo */}
            <div className="w-full md:w-1/2 bg-gray-900 p-6 flex flex-col">
              <h3 className="text-xl font-semibold text-white mb-4">See it in action</h3>
              <div className="relative flex-1 bg-black rounded-xl overflow-hidden">
                {/* Video Player */}
                <video 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  poster="/images/app-demo-poster.jpg"
                >
                  <source src="/videos/app-demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
                  <button 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 hover:bg-white transition-all flex items-center justify-center group"
                    onClick={(e) => {
                      e.stopPropagation();
                      const video = e.currentTarget.closest('.relative')?.querySelector('video');
                      if (video) {
                        video.paused ? video.play() : video.pause();
                      }
                    }}
                  >
                    <span className="i-ph:play-fill text-3xl text-blue-600 group-hover:text-blue-700 transition-colors ml-1"></span>
                  </button>
                </div>
                
                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-8 flex items-center">
                  <div className="flex-1 bg-white/20 h-1 rounded-full overflow-hidden">
                    <div className="bg-white h-full w-1/3"></div>
                  </div>
                  <span className="text-xs text-white/80 ml-3 font-mono">0:30 / 2:15</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-300 text-center">
                See how our platform can transform your workflow in under 3 minutes
              </p>
            </div>
            
            {/* Right Side - Upgrade Content */}
            <div className="w-full md:w-1/2 p-8 overflow-y-auto">
              {/* Upgrade Header */}
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
                  <span className="i-ph:crown-fill text-3xl text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upgrade to Pro</h2>
                <p className="text-gray-600 dark:text-gray-300">Unlock all premium features and take your experience to the next level.</p>
                
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-center items-baseline mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">$25</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {[
                      'Create Unlimited Apps',
                      'GitHub Integration',
                      'Full Stack Web App Builder',
                      'Dev-server with Preview',
                      'Dev Assistant',
                      'Early Access to New Features',
                      'Priority Email Support',
                      'Host website to Netlify'
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="i-ph:check-circle-fill text-green-500 mr-2"></span>
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleUpgradeClick}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="i-ph:arrow-right text-xl" />
                  Continue
                </button>
                
                 {/* <button
                  onClick={handleMaybeLater}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Continue with Basic (Limited Features)
                </button> */}
                
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                  Need help? <a href="#" className="text-blue-600 hover:underline dark:text-blue-400">Contact support</a>
                </p>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}