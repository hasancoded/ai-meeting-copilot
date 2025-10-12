import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export const Card = ({
  children,
  hover = false,
  className = "",
  ...props
}: CardProps) => {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${
        hover
          ? "hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardBody = ({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
