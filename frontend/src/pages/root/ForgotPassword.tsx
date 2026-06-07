import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/landing/LoadingButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordData } from "@/lib/schemas/authSchema";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const ForgotPassword = () => {
  const [isSent, setIsSent] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordData) {
    try {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) {
        throw new Error(error.message);
      }

      setEmailSentTo(data.email);
      setIsSent(true);
      toast.success("Reset link sent successfully!");
    } catch (error) {
      console.error("Error sending reset password link:", error);
      toast.error(getErrorMessage(error));
    }
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
          Forgot Password
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          No worries! Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      {isSent ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-300">Reset email sent!</p>
              <p className="text-xs opacity-90 mt-0.5">
                We have sent a password reset link to <strong className="break-all">{emailSentTo}</strong>. Please check your inbox and spam folders.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsSent(false)}
              className="text-accent hover:underline text-sm font-medium flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" /> Try another email address
            </button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="you@gmail.com"
                disabled={isSubmitting}
                {...register("email")}
                className={`h-12 pl-11 bg-accent/10 ${errors.email ? "border-destructive" : "border-border"}`}
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <LoadingButton
            type="submit"
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
            loadingText="Sending link..."
            className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-all"
          >
            Send Reset Link
          </LoadingButton>

          <p className="text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </motion.div>
  );
};

export default ForgotPassword;
