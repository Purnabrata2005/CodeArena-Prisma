import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import GoogleSignInButton from "@/components/landing/googleButton";
import SignupForm from "@/features/auth/components/signupForm";

const Signup = () => {
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
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create account
          </h1>
          <p className="text-muted-foreground text-sm-mt-1">
            Enter your details below to create your account
          </p>
        </div>

        {/* Social Provider */}
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
          <SignupForm />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Signup;
