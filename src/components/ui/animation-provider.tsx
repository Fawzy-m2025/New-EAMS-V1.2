
import React, { createContext, useContext, useState } from 'react';

interface AnimationContextValue {
  animationPreset: 'minimal' | 'standard' | 'enhanced';
  setAnimationPreset: (preset: 'minimal' | 'standard' | 'enhanced') => void;
  isReducedMotion: boolean;
}

const AnimationContext = createContext<AnimationContextValue | undefined>(undefined);

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [animationPreset, setAnimationPreset] = useState<'minimal' | 'standard' | 'enhanced'>('standard');
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <AnimationContext.Provider value={{ animationPreset, setAnimationPreset, isReducedMotion }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}
