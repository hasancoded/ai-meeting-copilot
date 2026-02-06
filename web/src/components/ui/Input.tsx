import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 transition-all duration-200 placeholder:text-gray-400 ${
            error
              ? "border-error-500 focus-visible:ring-error-500 focus-visible:border-error-500"
              : "border-gray-300 hover:border-gray-400"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-error-600 font-medium">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
