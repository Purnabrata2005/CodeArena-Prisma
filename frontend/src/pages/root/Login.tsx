import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import LoginForm from "@/features/auth/loginForm";
import { Link, useSearchParams } from "react-router-dom";
import GoogleSignInButton from "@/components/landing/googleButton";
import { CheckCircle2, AlertCircle } from "lucide-react";

const Login = () => {
  const [searchParams] = useSearchParams();
  const verified = searchParams.get("verified");
  const verificationError = searchParams.get("verification_error");

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
          Login to LeetLab
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back! Sign in to continue your coding journey.
        </p>
      </div>

      {/* Verification Success Alert */}
      {verified === "true" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-700 dark:text-green-300">Email verified successfully!</p>
            <p className="text-xs opacity-90 mt-0.5">You can now sign in to your account with your credentials.</p>
          </div>
        </motion.div>
      )}

      {/* Verification Failure Alert */}
      {verificationError === "true" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-300">Verification failed</p>
            <p className="text-xs opacity-90 mt-0.5">The verification link is invalid or has expired. Please check your inbox or try signing up again.</p>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-4">
        <GoogleSignInButton text="Sign up with Google" />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase">
          OR CONTINUE WITH EMAIL
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="flex flex-col gap-4">
        <LoginForm/>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="text-accent hover:underline font-medium">
          Create here
        </Link>
      </p>
    </motion.div>
  );
};

export default Login;
