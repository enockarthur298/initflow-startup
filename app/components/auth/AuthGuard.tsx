import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/remix';
import * as Dialog from '@radix-ui/react-dialog';

declare global {
  interface Window {
    Clerk?: {
      openSignIn: (options?: any) => void;
      // Add other Clerk methods if needed
    };
  }
}

// Utility to wait for an element to appear in the DOM
const waitForElement = (selector: string, timeout = 5000): Promise<Element | null> => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const clerkModalRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const isMounted = useRef(true);

  // Set up mutation observer to watch for Clerk modal changes
  const setupModalObserver = useCallback(() => {
    // Clean up any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Find the Clerk modal
    const clerkModal = document.querySelector('.cl-modal');
    if (!clerkModal || !clerkModal.parentNode) {
      if (isMounted.current && !isSignedIn) {
        setShowAuthDialog(true);
      }
      return;
    }

    // Store the modal reference
    clerkModalRef.current = clerkModal as HTMLElement;

    // Create a new observer to watch for modal removal
    observerRef.current = new MutationObserver((mutations) => {
      if (!isMounted.current) return;
      
      // Check if the modal was removed
      const modalWasRemoved = mutations.some(mutation => 
        Array.from(mutation.removedNodes).some(node => 
          node === clerkModalRef.current || 
          (node instanceof HTMLElement && node.contains(clerkModalRef.current))
        )
      );

      if (modalWasRemoved && !isSignedIn) {
        setShowAuthDialog(true);
      }
    });

    // Start observing the modal's parent for changes
    observerRef.current.observe(clerkModal.parentNode, { childList: true });
  }, [isSignedIn]);

  // Prevent closing the dialog by clicking outside or pressing escape
  const handleOpenChange = (open: boolean) => {
    if (!open) return; // Prevent closing the dialog
    setShowAuthDialog(true);
  };

  const handleSignIn = useCallback(async () => {
    // Don't close our dialog yet - we'll let Clerk handle the transition
    
    // Open Clerk's sign-in modal
    if (window.Clerk && typeof window.Clerk.openSignIn === 'function') {
      // First, open Clerk's modal
      window.Clerk.openSignIn();
      
      // Wait a brief moment before checking for Clerk's modal
      setTimeout(() => {
        // Now close our dialog - Clerk's modal should be on top
        setShowAuthDialog(false);
        
        // Set up observer for Clerk's modal
        const checkModal = async () => {
          const clerkModal = await waitForElement('.cl-modal', 1000);
          if (clerkModal) {
            // Ensure Clerk's modal is on top
            (clerkModal as HTMLElement).style.zIndex = '99999';
            setupModalObserver();
          } else if (isMounted.current && !isSignedIn) {
            // If modal didn't appear, show our dialog again
            setShowAuthDialog(true);
          }
        };
        
        checkModal();
      }, 100);
    }
  }, [isSignedIn, setupModalObserver]);
  
  // Set up initial state and block background interactions
  useEffect(() => {
    isMounted.current = true;
    
    if (isLoaded && !isSignedIn) {
      setShowAuthDialog(true);
    }
    
    // Block background scrolling when dialog is shown
    if (showAuthDialog) {
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'none';
      
      // Re-enable pointer events for the dialog itself
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
      if (dialog) {
        dialog.style.pointerEvents = 'auto';
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    }
    
    return () => {
      isMounted.current = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      // Cleanup styles on unmount
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, [isLoaded, isSignedIn, showAuthDialog]);

  if (!isLoaded || isSignedIn) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Dialog.Root open={showAuthDialog} onOpenChange={handleOpenChange} modal={true}>
        <Dialog.Portal>
          <Dialog.Overlay 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]" 
            style={{ pointerEvents: 'auto' }}
          />
          <Dialog.Content 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md z-[101] border border-gray-200 dark:border-gray-700"
            onPointerDownOutside={(e) => e.preventDefault()} // Prevent closing on outside click
            style={{ pointerEvents: 'auto' }} // Ensure content is clickable
          >
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <span className="i-ph:lock-key text-3xl text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="space-y-2">
                <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome to InitFlow
                </Dialog.Title>
                <Dialog.Description className="text-gray-600 dark:text-gray-300 text-base">
                  Please sign in to access the full experience
                </Dialog.Description>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="i-ph:sign-in text-xl" />
                  Sign In
                </button>
                
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Authentication required to continue
                </p>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
