import React from 'react';

interface CircularProgressProps {
  size?: number; // Diameter of the circle
  strokeWidth?: number; // Width of the progress stroke
  className?: string; // Additional custom class names
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 50,
  strokeWidth = 4,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      width={size}
      height={size}
      className={`animate-spin ${className}`}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        className='text-gray-200'
        strokeWidth={strokeWidth}
        stroke='currentColor'
        fill='transparent'
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className='text-blue-500'
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference / 4}
        strokeLinecap='round'
        stroke='currentColor'
        fill='transparent'
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ transition: 'stroke-dashoffset 0.35s' }}
      />
    </svg>
  );
};

export default CircularProgress;
