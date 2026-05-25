import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProblemStore } from "@/store/useProblemStore";
import StreakLoti from "@/assets/streakLoti";
import { Sparkles, Trophy, X } from "lucide-react";

export default function StreakCelebration() {
  const { showStreakCelebration, celebrationStreakCount, closeStreakCelebration } = useProblemStore();
  const [phase, setPhase] = useState<"enter" | "fly">("enter");
  const [targetCoords, setTargetCoords] = useState({ x: 0, y: 0 });

  const flyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!showStreakCelebration) {
      return;
    }

    // Step 1: Set timer to initiate the flying phase
    flyTimerRef.current = setTimeout(() => {
      // Find the navbar widget coordinates
      const rect = document.getElementById("navbar-streak-widget")?.getBoundingClientRect();
      if (rect) {
        // Calculate relative coordinates from screen center
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;
        
        // Center of the screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        setTargetCoords({
          x: targetX - centerX,
          y: targetY - centerY,
        });
      } else {
        // Fallback: Fly to top right
        setTargetCoords({
          x: window.innerWidth / 2 - 100,
          y: -window.innerHeight / 2 + 50,
        });
      }
      setPhase("fly");
    }, 2500);

    return () => {
      if (flyTimerRef.current) clearTimeout(flyTimerRef.current);
      setPhase("enter");
    };
  }, [showStreakCelebration]);

  const handleSkip = () => {
    if (phase !== "enter") return;

    if (flyTimerRef.current) clearTimeout(flyTimerRef.current);

    const rect = document.getElementById("navbar-streak-widget")?.getBoundingClientRect();
    if (rect) {
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      setTargetCoords({
        x: targetX - centerX,
        y: targetY - centerY,
      });
    } else {
      setTargetCoords({
        x: window.innerWidth / 2 - 100,
        y: -window.innerHeight / 2 + 50,
      });
    }

    setPhase("fly");
  };

  return (
    <AnimatePresence>
      {showStreakCelebration && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md pointer-events-none"
      >
        {/* Skip/Close Button */}
        <AnimatePresence>
          {phase === "enter" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleSkip}
              className="absolute top-6 right-6 p-2.5 rounded-full border border-border bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-50 pointer-events-auto"
              aria-label="Skip animation"
            >
              <X className="size-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Decorative background glow */}
        {phase === "enter" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#f97316,transparent)]"
          />
        )}

        <div className="flex flex-col items-center justify-center relative">
          
          {/* Celebrating text block (fades out when flame flies) */}
          <AnimatePresence>
            {phase === "enter" && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                className="text-center mb-6 flex flex-col items-center"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-500 text-sm font-semibold mb-4">
                  <Sparkles className="size-4 animate-spin" style={{ animationDuration: "3s" }} />
                  Daily coding streak active!
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground flex items-center gap-2">
                  <Trophy className="size-10 text-amber-500" />
                  Streak Extended!
                </h2>
                <p className="mt-2 text-muted-foreground text-md max-w-xs">
                  Consistency is key. Keep up the excellent work!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flying Flame Animation */}
          <motion.div
            layout
            initial={{ scale: 0.3, y: 50, opacity: 0 }}
            animate={
              phase === "enter"
                ? { 
                    scale: 1, 
                    y: 0, 
                    opacity: 1,
                    transition: { type: "spring", stiffness: 200, damping: 20 }
                  }
                : { 
                    x: targetCoords.x, 
                    y: targetCoords.y, 
                    scale: 0.15,
                    opacity: 0.5,
                    transition: { type: "spring", stiffness: 120, damping: 18 }
                  }
            }
            className="relative flex items-center justify-center pointer-events-none"
            style={{ originX: 0.5, originY: 0.5 }}
            onAnimationComplete={() => {
              if (phase === "fly") {
                closeStreakCelebration();
              }
            }}
          >
            {phase === "enter" && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute size-40 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"
              />
            )}
            <StreakLoti className="size-48 md:size-64" />
          </motion.div>

          {/* Flame streak count badge (fades out when flame flies) */}
          <AnimatePresence>
            {phase === "enter" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-full text-2xl font-black shadow-lg shadow-orange-500/30 flex items-center gap-2"
              >
                <span>🔥</span>
                <span>{celebrationStreakCount} Days</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
