// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginData } from "@/lib/schema";
import { useAuthStore } from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import LoadingButton from "@/components/landing/LoadingButton";

const loginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login, isLoggingIn: isPending } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginData) {
    try {
      await login(data);
      navigate("/");
    } catch (error) {
      console.error("Error during login:", error);
    }
  }
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@gmail.com"
            disabled={isPending}
            {...register("email")}
            className={`h-12 bg-accent/10 ${errors.email ? "border-destructive" : "border-border"}`}
          />
          {errors.email && (
            <p className="text-xs font-medium text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={isPending}
              {...register("password")}
              className={`h-12 pr-11 bg-accent/10 ${errors.password ? "border-destructive" : "border-border"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <LoadingButton
          type="submit"
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
          loadingText="Logging in..."
          className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-all"
        >
          Login
        </LoadingButton>
      </form>
    </div>
  );
};

export default loginForm;
