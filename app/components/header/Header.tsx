import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/remix';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      className={classNames('flex items-center justify-between p-5 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      })}
    >
      <div className="flex-1 flex items-center">
        {chat.started && (
          <div className="flex items-center">
            <span className="truncate text-bolt-elements-textPrimary">
              <ClientOnly>{() => <ChatDescription />}</ClientOnly>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {chat.started && (
          <ClientOnly>
            {() => <HeaderActionButtons />}
          </ClientOnly>
        )}

        {/* Auth buttons with improved styling */}
        <SignedIn>
          {/* User is signed in, show user button */}
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: "w-9 h-9",
                userButtonTrigger: "focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full hover:opacity-80 transition-opacity"
              }
            }}
          />
        </SignedIn>
        <SignedOut>
          {/* User is signed out, show sign in/up buttons with improved styling */}
          <SignInButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium text-bolt-elements-textPrimary hover:text-blue-600 border border-bolt-elements-borderColor hover:border-blue-500 rounded-lg transition-all duration-200 flex items-center gap-1.5">
              <div className="i-ph:sign-in text-lg" />
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-1.5">
              <div className="i-ph:user-plus text-lg" />
              Sign up
            </button>
          </SignUpButton>
        </SignedOut>
      </div>
    </header>
  );
}