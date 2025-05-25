import { AnimatePresence, motion } from 'framer-motion';
import React, { useState, useMemo } from 'react';
import type { ProgressAnnotation } from '~/types/context';
import { classNames } from '~/utils/classNames';
import { cubicEasingFn } from '~/utils/easings';

// Status indicator component
const StatusIcon = ({ status }: { status: ProgressAnnotation['status'] }) => (
  <div className="w-3 h-3 flex-shrink-0">
    {status === 'in-progress' ? (
      <div className="w-full h-full rounded-full border border-current border-t-transparent animate-spin" />
    ) : status === 'complete' ? (
      <div className="w-full h-full flex items-center justify-center text-green-500">
        <div className="i-ph:check text-xs" />
      </div>
    ) : (
      <div className="w-full h-full rounded-full bg-gray-400" />
    )}
  </div>
);

// Single progress item component
const ProgressItem = ({ progress }: { progress: ProgressAnnotation }) => (
  <motion.div
    className="flex items-center gap-2 py-1.5 px-2 rounded-md group hover:bg-bolt-elements-item-backgroundHover transition-colors"
    initial={{ opacity: 0, x: -4 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -4 }}
    transition={{ duration: 0.15, ease: 'easeOut' }}
  >
    <StatusIcon status={progress.status} />
    <div className="flex-1 min-w-0">
      <div className="text-xs font-medium text-bolt-elements-textPrimary truncate">
        {progress.label}
      </div>
      {progress.message && (
        <div className="text-[11px] text-bolt-elements-textSecondary/80 truncate">
          {progress.message}
        </div>
      )}
    </div>
  </motion.div>
);

// Progress list component with animations
const ProgressList = ({ items }: { items: ProgressAnnotation[] }) => (
  <motion.div
    className="space-y-0.5 overflow-hidden"
    initial="collapsed"
    animate="open"
    exit="collapsed"
    variants={{
      open: { height: 'auto' },
      collapsed: { height: 0 }
    }}
    transition={{ duration: 0.15, ease: 'easeInOut' }}
  >
    {items.map((item, index) => (
      <ProgressItem key={`${item.label}-${index}`} progress={item} />
    ))}
  </motion.div>
);

export default function ProgressCompilation({ data }: { data?: ProgressAnnotation[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Process and deduplicate progress items
  const progressList = useMemo(() => {
    if (!data?.length) return [];
    
    const progressMap = new Map<string, ProgressAnnotation>();
    
    data.forEach((item) => {
      const existing = progressMap.get(item.label);
      if (!existing || existing.status !== 'complete') {
        progressMap.set(item.label, item);
      }
    });
    
    return Array.from(progressMap.values()).sort((a, b) => a.order - b.order);
  }, [data]);

  // Don't render if no progress items
  if (!progressList.length) return null;
  
  const latestItem = progressList[progressList.length - 1];
  const hasMultipleItems = progressList.length > 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.15 }}
        className={classNames(
          'bg-bolt-elements-background-depth-2',
          'border border-bolt-elements-borderColor/30',
          'rounded-lg w-full max-w-chat mx-auto z-prompt',
          'overflow-hidden',
          'transition-all duration-150',
          isExpanded ? 'shadow-lg' : 'shadow-md'
        )}
      >
        <div className="bg-bolt-elements-item-backgroundAccent/80 p-1 rounded-lg">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex-1 min-w-0">
              {isExpanded ? (
                <ProgressList items={progressList} />
              ) : (
                <ProgressItem progress={latestItem} />
              )}
            </div>
            
            {hasMultipleItems && (
              <motion.button
                className={classNames(
                  'p-1 rounded-md transition-colors',
                  'text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary',
                  'hover:bg-bolt-elements-item-backgroundHover',
                  'focus:outline-none',
                  'flex-shrink-0 text-xs'
                )}
                onClick={() => setIsExpanded(v => !v)}
                aria-label={isExpanded ? 'Collapse progress' : 'Expand progress'}
                whileTap={{ scale: 0.9 }}
              >
                <div className={isExpanded ? 'i-ph:caret-up' : 'i-ph:caret-down'} />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// This component has been moved and enhanced above
