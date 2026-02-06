import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md focus-visible:ring-primary-500 shadow-sm",
      secondary:
        "bg-gray-600 text-white hover:bg-gray-700 hover:shadow-md focus-visible:ring-gray-500 shadow-sm",
      outline:
        "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-gray-500",
      ghost:
        "text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500",
      danger:
        "bg-error-600 text-white hover:bg-error-700 hover:shadow-md focus-visible:ring-error-500 shadow-sm",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm min-h-[36px]",
      md: "px-4 py-2.5 text-base min-h-[44px]",
      lg: "px-6 py-3 text-lg min-h-[52px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
