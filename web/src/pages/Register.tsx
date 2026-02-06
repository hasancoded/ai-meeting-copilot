import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { Video } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.email, data.password, data.name);
      navigate("/");
    } catch {
      // Error is handled by API interceptor
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4 py-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg mb-2 transform hover:scale-105 transition-transform">
            <Video className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Create Account
          </h1>
          <p className="text-gray-600 text-sm">
            Start managing your meetings with AI
          </p>
        </div>

        {/* Register Form */}
        <Card className="shadow-xl">
          <CardBody className="p-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
              <Input
                label="Name (optional)"
                type="text"
                placeholder="John Doe"
                error={errors.name?.message}
                className="text-sm"
                {...register("name")}
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                className="text-sm"
                {...register("email")}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Create a password"
                error={errors.password?.message}
                className="text-sm"
                {...register("password")}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                className="text-sm"
                {...register("confirmPassword")}
              />

              <Button
                type="submit"
                className="w-full h-10 text-sm mt-3"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
