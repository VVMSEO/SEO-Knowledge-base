import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  wrapperClassName?: string;
}

export function Tooltip({ content, children, position = 'top', className, wrapperClassName }: TooltipProps) {
  return (
    <div className={cn("group relative inline-flex", wrapperClassName)}>
      {children}
      <div className={cn(
        "absolute hidden group-hover:block w-max max-w-xs z-[100]",
        "bg-slate-800 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-xl border border-slate-700/50",
        "pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity delay-150 duration-200",
        position === 'top' && "bottom-full mb-1.5 left-1/2 -translate-x-1/2",
        position === 'bottom' && "top-full mt-1.5 left-1/2 -translate-x-1/2",
        position === 'left' && "right-full mr-1.5 top-1/2 -translate-y-1/2",
        position === 'right' && "left-full ml-1.5 top-1/2 -translate-y-1/2",
        className
      )}>
        {content}
        <div className={cn(
          "absolute w-1.5 h-1.5 bg-slate-800 border-slate-700/50 transform rotate-45 z-[-1]",
          position === 'top' && "top-full -mt-1 left-1/2 -translate-x-1/2 border-b border-r",
          position === 'bottom' && "bottom-full -mb-1 left-1/2 -translate-x-1/2 border-t border-l",
          position === 'left' && "left-full -ml-1 top-1/2 -translate-y-1/2 border-t border-r",
          position === 'right' && "right-full -mr-1 top-1/2 -translate-y-1/2 border-b border-l",
        )}></div>
      </div>
    </div>
  );
}
