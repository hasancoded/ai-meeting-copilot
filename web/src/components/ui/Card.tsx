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
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${
        hover
          ? "hover:shadow-lg hover:border-primary-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5"
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
      className={`px-6 py-5 border-b border-gray-100 ${className}`}
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
    <div className={`px-6 py-5 ${className}`} {...props}>
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
      className={`px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
