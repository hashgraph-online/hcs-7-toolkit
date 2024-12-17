import { ReactNode, FC } from "react";

type IconButtonSize = "small" | "medium" | "large" | "xlarge";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: IconButtonSize;
}

const IconButton: FC<IconButtonProps> = ({
  children,
  className = "",
  size = "medium",
  ...props
}) => {
  const sizeClasses = {
    small: "p-1 text-sm",
    medium: "p-2 text-base",
    large: "p-3 text-lg",
    xlarge: "p-4 text-xl",
  };

  const baseClasses =
    "rounded-full dark:text-white text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-300";

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
