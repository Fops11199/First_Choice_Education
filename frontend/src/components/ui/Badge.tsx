import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseStyles = "accent-tag inline-flex items-center justify-center";
  
  const variants = {
    default: "bg-primary/10 text-primary",
    success: "bg-cam-green/10 text-cam-green",
    warning: "bg-cam-yellow/20 text-yellow-800",
    error: "bg-cam-red/10 text-cam-red",
    outline: "border border-slate-200 text-slate-600 bg-transparent",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
