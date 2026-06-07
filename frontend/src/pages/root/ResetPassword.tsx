import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/landing/LoadingButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordData } from "@/lib/schemas/authSchema";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { Eye, EyeOff, KeyRound, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Password reset token is missing. Please request a new link.");
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordData) {
    if (!token) {
      toast.error("Missing password reset token. Please request a new link.");
      return;
    }

    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.password,
        token: token,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Password reset successful! You can now login with your new password.");
      navigate("/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(getErrorMessage(error));
    }
  }

  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6 text-center"
      >
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Invalid or Missing Token
          </h1>
          <p className="text-muted-foreground text-sm">
            The password reset link is invalid or has expired. Please try requesting a new link.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-all w-full"
          >
            Request Reset Link
          </Link>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-accent hover:underline font-medium">
            Back to login
          </Link>
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="w-full max-w-md space-y-8"
    >
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Reset Password
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter your new password below. Ensure it is secure and meets requirements.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={isSubmitting}
              {...register("password")}
              className={`h-12 pl-11 pr-11 bg-accent/10 ${errors.password ? "border-destructive" : "border-border"}`}
            />
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={isSubmitting}
              {...register("confirmPassword")}
              className={`h-12 pl-11 pr-11 bg-accent/10 ${errors.confirmPassword ? "border-destructive" : "border-border"}`}
            />
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <LoadingButton
          type="submit"
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
          loadingText="Resetting..."
          className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-all pt-2"
        >
          Reset Password
        </LoadingButton>

        <p className="text-center text-sm text-muted-foreground pt-2">
          Remembered your password?{" "}
          <Link to="/login" className="text-accent hover:underline font-medium">
            Back to login
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default ResetPassword;
