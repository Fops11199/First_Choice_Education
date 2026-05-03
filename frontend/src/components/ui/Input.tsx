import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20
            ${error 
              ? 'border-cam-red focus:border-cam-red' 
              : 'border-slate-200 hover:border-slate-300 focus:border-primary'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-cam-red font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
