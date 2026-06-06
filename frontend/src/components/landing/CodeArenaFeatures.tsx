import { features } from "@/constants";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MorphingText } from "@/components/landing/liquid-text";

const texts = [
  "Solve",
  "Code",
  "Learn",
  "Master",
  "Challenge",
  "Grow",
  "Innovate",
  "Succeed",
];

// Color configuration maps for each card theme based on the title
const cardThemeMap: Record<
  string,
  {
    iconClass: string;
    glowClass: string;
    borderHoverClass: string;
  }
> = {
  "Run Code": {
    iconClass: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 ring-emerald-500/20",
    glowClass: "bg-emerald-500/10 dark:bg-emerald-500/5",
    borderHoverClass: "hover:border-emerald-500/30 hover:shadow-emerald-500/5",
  },
  "Submit Solution": {
    iconClass: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30 ring-blue-500/20",
    glowClass: "bg-blue-500/10 dark:bg-blue-500/5",
    borderHoverClass: "hover:border-blue-500/30 hover:shadow-blue-500/5",
  },
  "Auto Save": {
    iconClass: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/20 dark:border-purple-500/30 ring-purple-500/20",
    glowClass: "bg-purple-500/10 dark:bg-purple-500/5",
    borderHoverClass: "hover:border-purple-500/30 hover:shadow-purple-500/5",
  },
  "Code Snippets": {
    iconClass: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-500/20 dark:border-orange-500/30 ring-orange-500/20",
    glowClass: "bg-orange-500/10 dark:bg-orange-500/5",
    borderHoverClass: "hover:border-orange-500/30 hover:shadow-orange-500/5",
  },
  "Share Solutions": {
    iconClass: "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 border border-pink-500/20 dark:border-pink-500/30 ring-pink-500/20",
    glowClass: "bg-pink-500/10 dark:bg-pink-500/5",
    borderHoverClass: "hover:border-pink-500/30 hover:shadow-pink-500/5",
  },
  "Problem Library": {
    iconClass: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 ring-indigo-500/20",
    glowClass: "bg-indigo-500/10 dark:bg-indigo-500/5",
    borderHoverClass: "hover:border-indigo-500/30 hover:shadow-indigo-500/5",
  },
};

export default function CodeArenaFeatures() {
  return (
    <section className="relative w-full py-24 px-6 md:px-12 bg-gradient-to-b from-transparent via-slate-50/30 to-background dark:via-zinc-950/20 overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/3 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] bg-accent/5 dark:bg-accent/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="mb-16 text-center">
          <MorphingText texts={texts} />
          <p className="max-w-2xl mx-auto text-muted-foreground mt-4 text-lg md:text-xl font-normal leading-relaxed">
            Master coding challenges and ace your technical interviews with Leet Master.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12 relative z-10">
          {features.map((action) => {
            const theme = cardThemeMap[action.title] || {
              iconClass: "bg-muted text-muted-foreground",
              glowClass: "bg-muted/10",
              borderHoverClass: "hover:border-muted/30",
            };
            
            return (
              <Card
                key={action.title}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl focus-within:ring-2 focus-within:ring-primary/50 border-slate-200/50 dark:border-zinc-800/50",
                  theme.borderHoverClass
                )}
              >
                {/* Hover Ambient Glow */}
                <div
                  className={cn(
                    "absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl -z-10",
                    theme.glowClass
                  )}
                />
                
                <CardContent className="p-8 flex flex-col h-full justify-between">
                  <div>
                    {/* Icon Container */}
                    <div className="mb-6">
                      <span
                        className={cn(
                          "inline-flex rounded-xl p-3.5 ring-1 ring-inset transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                          theme.iconClass
                        )}
                      >
                        <action.icon aria-hidden="true" className="h-6 w-6" />
                      </span>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-50 mb-2 group-hover:text-primary transition-colors duration-200">
                        {action.title}
                      </h3>
                      <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

