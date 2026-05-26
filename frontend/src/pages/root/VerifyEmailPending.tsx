import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { Button } from "@heroui/react";

const VerifyEmailPending = () => {
  const location = useLocation();
  const email = location.state?.email || "";

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

      <div className="w-full max-w-md space-y-6 text-center">
        {/* Animated Icon Box */}
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-20 w-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent"
            >
              <Mail className="h-10 w-10" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 border-2 border-background"
            >
              <CheckCircle2 className="h-4 w-4" />
            </motion.div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Verify your email
          </h1>
          <p className="text-muted-foreground text-sm">
            We've sent a verification link to your inbox. Please verify your email to activate your account.
          </p>
        </div>

        {/* Display Email Address if available */}
        {email && (
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 text-sm font-medium text-foreground break-all">
            {email}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-2 text-left bg-muted/40 p-4 rounded-xl border border-border">
          <p className="font-semibold text-foreground">Next Steps:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Check your email inbox for a verification email.</li>
            <li>Click the link inside to verify your email.</li>
            <li>If you don't receive it within a few minutes, check your <strong>Spam</strong> or <strong>Promotions</strong> folder.</li>
          </ul>
        </div>

        <div className="pt-2">
          <Link to="/login">
            <Button
              className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-all flex items-center justify-center gap-2"
            >
              Go to Login Page
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default VerifyEmailPending;
