import React from 'react';
import { cn } from '../../lib/utils';

interface NeuralCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function NeuralCard({ children, className }: NeuralCardProps) {
  return (
    <div className={cn("bg-card border border-border/60 rounded-2xl shadow-sm backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}