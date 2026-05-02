import { useFormContext } from "react-hook-form";
import type { ProblemValues } from "@/lib/schemas/problemSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export default function StepAdditional() {
  const { control } = useFormContext<ProblemValues>();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="constraints"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Constraints</FormLabel>
            <FormControl>
              <Textarea placeholder="e.g. 1 <= n <= 10^5" className="min-h-24 font-mono text-sm" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="hints"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Hints (Optional)</FormLabel>
            <FormControl>
              <Textarea placeholder="Provide hints for solving the problem" className="min-h-24" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="editorial"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Editorial (Optional)</FormLabel>
            <FormControl>
              <Textarea placeholder="Solution explanation / editorial" className="min-h-32" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
