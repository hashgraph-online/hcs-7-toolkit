import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  children: React.ReactNode;
  className?: string;
}

const Typography: React.FC<TypographyProps> = ({
  variant,
  children,
  className,
}) => {
  const baseStyles =
    'font-sans leading-relaxed transition-all duration-300 ease-in-out';

  const variantStyles = {
    h1: 'text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400',
    h2: 'text-4xl font-semibold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400',
    h3: 'text-3xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400',
    h4: 'text-2xl font-medium mb-3 text-blue-700 dark:text-blue-300',
    h5: 'text-xl font-medium mb-2 text-blue-800 dark:text-blue-200',
    h6: 'text-lg font-medium mb-2 text-blue-900 dark:text-blue-100',
    p: 'text-base mb-4 text-gray-700 dark:text-gray-300',
  };

  const Component = variant as keyof JSX.IntrinsicElements;

  return (
    <Component
      className={cn(
        baseStyles,
        variantStyles[variant],
        className,
        'hover:scale-[1.02] hover:drop-shadow-lg'
      )}
    >
      {children}
    </Component>
  );
};

export default Typography;