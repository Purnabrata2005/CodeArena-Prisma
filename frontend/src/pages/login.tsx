import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import LoginForm from "@/features/auth/components/loginForm";
import { Link } from "react-router-dom";
import GoogleSignInButton from "../components/landing/googleButton";

const Login = () => {
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
