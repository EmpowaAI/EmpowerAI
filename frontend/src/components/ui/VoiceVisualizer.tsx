import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface VoiceVisualizerProps {
  volume: number; // 0 to 1
  isActive: boolean;
  className?: string;
}

export default function VoiceVisualizer({ volume, isActive, className }: VoiceVisualizerProps) {
  const barCount = 12;
  
  return (
    <div className={cn("flex items-center justify-center gap-1 h-12", className)}>
      {Array.from({ length: barCount }).map((_, i) => {
        // Each bar responds slightly differently to the volume for a more organic feel
        const stagger = Math.sin((i / barCount) * Math.PI);
        const height = isActive 
          ? 6 + (volume * 48 * stagger) + (Math.random() * 4) 
          : 4;

        return (
          <motion.div
            key={i}
            animate={{ 
              height: height,
              backgroundColor: isActive ? (volume > 0.6 ? '#60a5fa' : '#3b82f6') : '#94a3b8',
              opacity: isActive ? 0.5 + (volume * 0.5) : 0.2
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-1.5 rounded-full"
            style={{ boxShadow: isActive && volume > 0.1 ? `0 0 ${volume * 20}px rgba(59, 130, 246, 0.5)` : 'none' }}
          />
        );
      })}
    </div>
  );
}