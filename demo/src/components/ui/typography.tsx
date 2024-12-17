import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  children: React.ReactNode;
  className?: string;
}

const Typography: React.FC<TypographyProps> = ({
  variant = 'p',
  children,
  className,
}) => {
  const baseStyles =
    'font-sans leading-relaxed transition-all duration-300 ease-in-out';

  const variantStyles = {
    h1: 'text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary',
    h2: 'text-4xl font-semibold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary',
    h3: 'text-3xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary',
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
