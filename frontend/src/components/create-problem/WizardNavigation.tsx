import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react";

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  action?: "create" | "update";
}

export default function WizardNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSubmit,
  isSubmitting,
  action = "create",
}: WizardNavigationProps) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between border-t border-border pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 0}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <span className="text-sm text-muted-foreground">
        Step {currentStep + 1} of {totalSteps}
      </span>

      {isLastStep ? (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {action === "create" ? "Creating..." : "Updating..."}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {action === "create" ? "Create Problem" : "Update Problem"}
            </>
          )}
        </Button>
      ) : (
        <Button type="button" onClick={onNext} className="gap-2">
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
