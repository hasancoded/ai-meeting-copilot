import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { Video } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch {
      // Error is handled by API interceptor
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-lg mb-3 transform hover:scale-105 transition-transform">
            <Video className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Meeting Copilot
          </h1>
          <p className="text-gray-600 text-sm">
            Sign in to your Meeting Copilot account
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl">
          <CardBody className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register("password")}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
