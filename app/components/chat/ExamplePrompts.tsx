import React from 'react';

const EXAMPLE_PROMPTS = [
  { 
    title: 'Mobile App',
    text: 'Build a fitness tracker with React Native',
    description: 'Create a cross-platform mobile app to track workouts, set goals, and visualize progress with charts.',
    icon: '📱'
  },
  { 
    title: 'Web App',
    text: 'Create a modern e-commerce dashboard',
    description: 'Build an admin dashboard with React, TypeScript, and Tailwind CSS to manage products, orders, and analytics.',
    icon: '🖥️'
  },
  { 
    title: 'Mobile App',
    text: 'Design a food delivery app UI',
    description: 'Create a beautiful mobile UI for a food delivery service with menu, cart, and order tracking features.',
    icon: '🍔'
  },
  { 
    title: 'Web App',
    text: 'Develop a real-time chat application',
    description: 'Build a full-stack chat application using Next.js, WebSockets, and a modern UI with dark mode support.',
    icon: '💬'
  }
];

export function ExamplePrompts(sendMessage?: { (event: React.UIEvent, messageInput?: string): void | undefined }) {
  return (
    <div id="examples" className="relative w-full max-w-4xl mx-auto mt-6 px-4">
      <h2 className="text-center text-base font-medium text-bolt-elements-textSecondary mb-4">
        Try these example prompts to get started
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {EXAMPLE_PROMPTS.map((prompt, index) => (
          <div 
            key={index}
            onClick={(event) => sendMessage?.(event, prompt.text)}
            className="group relative p-4 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-bg-depth-2 hover:bg-bolt-elements-item-backgroundActive cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-left"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent text-base">
                {prompt.icon}
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-xs font-medium text-bolt-elements-textSecondary">
                  {prompt.title}
                </p>
                <h3 className="text-sm font-semibold text-bolt-elements-textPrimary line-clamp-1">
                  {prompt.text}
                </h3>
                <p className="text-xs text-bolt-elements-textTertiary line-clamp-2">
                  {prompt.description}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-bolt-elements-borderColorActive transition-colors pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
