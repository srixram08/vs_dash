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
        'rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm transition-all',
        hoverable && 'hover:border-emerald-400 hover:shadow-md cursor-pointer',
        glow && 'border-emerald-300 shadow-glow-green',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
