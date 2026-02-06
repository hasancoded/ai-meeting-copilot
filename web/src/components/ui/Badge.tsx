import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}

export const Badge = ({
  variant = "default",
  children,
  className = "",
  ...props
}: BadgeProps) => {
  const variants = {
    default: "bg-gray-100 text-gray-700 border border-gray-200",
    success: "bg-success-50 text-success-700 border border-success-200",
    warning: "bg-warning-50 text-warning-700 border border-warning-200",
    danger: "bg-error-50 text-error-700 border border-error-200",
    info: "bg-info-50 text-info-700 border border-info-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
