import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle2, Inbox, KeyRound, ShieldAlert, Copy, Check } from "lucide-react";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { Button } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getErrorMessage } from "@/lib/utils";

const VerifyEmailPending = () => {
  const location = useLocation();
  const email = location.state?.email || "";
  const [isResending, setIsResending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address not found. Please try logging in or signing up again.");
      return;
    }
    setIsResending(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: window.location.origin + "/login?verified=true",
      });
      if (error) {
        throw new Error(error.message);
      }
      toast.success("Verification email resent successfully!");
      setCooldown(60);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  const handleCopyEmail = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      icon: Inbox,
      title: "Check Inbox",
      shortDesc: "Primary folder",
      color: "text-accent bg-accent/10 border-accent/20",
    },
    {
      icon: KeyRound,
      title: "Click Link",
      shortDesc: "To activate",
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      icon: ShieldAlert,
      title: "Check Spam",
      shortDesc: "If missing",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="relative w-full max-w-md flex flex-col items-center">
      {/* Theme Toggle Positioned Beautifully */}
      <div className="w-full flex justify-end mb-3">
        <ThemeToggle />
      </div>

      {/* Glassmorphic Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full p-6 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col space-y-5"
      >
        {/* Glow Effects Behind Card */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none -z-10" />
        
        {/* Developer Grid Backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:24px_24px] rounded-3xl -z-10" />

        <div className="w-full text-center space-y-4">
          {/* Animated Mail Box */}
          <div className="flex justify-center relative py-1">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-accent/10 rounded-full blur-2xl -z-10 animate-pulse" />
            
            <motion.div
              whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
              animate={{ y: [0, -4, 0] }}
              transition={{ 
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.15 }
              }}
              className="relative h-16 w-16 rounded-2xl bg-card border border-border/80 flex items-center justify-center text-accent shadow-lg group cursor-pointer"
            >
              <div className="absolute inset-0 rounded-2xl bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <Mail className="h-8 w-8 text-accent group-hover:scale-110 transition-transform duration-300" />
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-background shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </motion.div>
            </motion.div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Verify your email
            </h1>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-xs mx-auto">
              We've sent a verification link to your inbox. Please check your mail to activate your account.
            </p>
          </div>

          {/* Secure Email Chip Display */}
          {email && (
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-accent/5 border border-accent/15 text-xs font-mono text-foreground break-all gap-3 shadow-inner group/chip"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping shrink-0" />
                <span className="truncate max-w-[240px] text-muted-foreground group-hover/chip:text-foreground transition-colors duration-200">
                  {email}
                </span>
              </div>
              <button 
                onClick={handleCopyEmail}
                className="p-1 rounded-lg hover:bg-accent/10 border border-transparent hover:border-accent/10 text-muted-foreground hover:text-accent transition-all duration-200 shrink-0 cursor-pointer"
                title="Copy email address"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in duration-200" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </motion.div>
          )}

          {/* Horizontal Grid Steps timeline */}
          <div className="space-y-2 text-left pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">
              Next Steps
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    className="flex flex-col items-center text-center p-2.5 rounded-xl border border-border/40 bg-muted/10 backdrop-blur-sm transition-all duration-200"
                  >
                    <div className={`p-1.5 rounded-lg border ${step.color} shrink-0 mb-1.5 shadow-sm`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="text-[11px] font-bold text-foreground leading-none">{step.title}</h4>
                    <p className="text-[9px] text-muted-foreground mt-1 leading-tight hidden sm:block">
                      {step.shortDesc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Buttons container */}
          <div className="pt-2 space-y-2.5">
            <Link to="/login" className="w-full block">
              <Button
                className="w-full h-11 text-sm font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-all flex items-center justify-center gap-2 shadow-md shadow-accent/15 hover:shadow-accent/25 hover:-translate-y-0.5 active:translate-y-0 duration-200"
              >
                Go to Login Page
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            
            <Button
              isDisabled={isResending || cooldown > 0}
              onClick={handleResend}
              className="w-full h-11 text-sm font-semibold border border-accent/20 bg-accent/5 hover:bg-accent/10 text-foreground transition-all flex items-center justify-center gap-2 duration-200"
            >
              {isResending ? (
                "Resending..."
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPending;
