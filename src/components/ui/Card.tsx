import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverable = false,
  glow = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md text-slate-100 shadow-sm transition-all',
        hoverable && 'hover:border-slate-700/80 hover:bg-slate-900/90 hover:shadow-md cursor-pointer',
        glow && 'border-primary-500/20 shadow-glow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
