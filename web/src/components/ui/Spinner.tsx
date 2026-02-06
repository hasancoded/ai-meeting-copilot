import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner = ({ size = "md", className = "" }: SpinnerProps) => {
  const sizes = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2
        className={`animate-spin text-primary-600 ${sizes[size]} ${className}`}
      />
    </div>
  );
};

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center animate-fade-in">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
};
