import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
  size?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, style, disabled, className, ...props }) => {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`transition-all duration-300 ease-in-out font-medium hover:opacity-90 flex items-center justify-center whitespace-nowrap outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3a1f1d] rounded-lg ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className || ''}`}
      style={style}
    >
      {children}
    </button>
  );
};
