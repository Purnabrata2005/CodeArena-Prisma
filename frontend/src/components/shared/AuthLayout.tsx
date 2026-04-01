import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

const typingTexts = ["Build Space", "One Platform", "Master DSA", "Code Daily"];

const AuthLayout = () => {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = typingTexts[textIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(current.slice(0, charIndex + 1));
        if (charIndex + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), 1500);
        } else {
          setCharIndex(charIndex + 1);
        }
      } else {
        setDisplayText(current.slice(0, charIndex - 1));
        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % typingTexts.length);
          setCharIndex(0);
        } else {
          setCharIndex(charIndex - 1);
        }
      }
    }, isDeleting ? 50 : 100);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Persistent Branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-accent/10 relative flex-col justify-between p-10"
      >
        <div className="h-12 w-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
          <Code2 className="h-6 w-6 text-accent" />
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight">
            <span className="text-accent">{displayText}</span>
            <span className="animate-pulse">|</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md">
            Continue your journey mastering Data Structures & Algorithms on LeetLab.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 LeetLab. All rights reserved.</p>
      </motion.div>

      {/* Right Panel - Dynamic Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-background">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;