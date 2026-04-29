import { cn } from "@/lib/utils";
import { Check, FileText, Code2, BookOpen, Lightbulb, TestTube } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { label: "Basic Info", icon: FileText },
  { label: "Test Cases", icon: TestTube },
  { label: "Code", icon: Code2 },
  { label: "Examples", icon: BookOpen },
  { label: "Details", icon: Lightbulb },
];

interface WizardProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps: Set<number>;
}

export default function WizardProgress({ currentStep, onStepClick, completedSteps }: WizardProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.has(index);
          const isCurrent = currentStep === index;

          return (
            <div key={step.label} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => onStepClick(index)}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 transition-all",
                  isCurrent && "scale-105",
                )}
              >
                <motion.div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isCurrent && "border-primary bg-primary text-primary-foreground shadow-lg",
                    isCompleted && !isCurrent && "border-secondary bg-secondary text-secondary-foreground",
                    !isCurrent && !isCompleted && "border-muted bg-muted text-muted-foreground",
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </motion.div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    isCurrent ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div className="mx-1 h-0.5 flex-1 rounded-full bg-muted sm:mx-2">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
