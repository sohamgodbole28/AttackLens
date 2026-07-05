import { Target, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/50">
      <div className="flex items-center gap-2 sm:gap-3">
        <Target className="h-8 w-8 text-primary" strokeWidth={2.5} />
        <div>
          <h1 className="text-xl sm:text-[22px] font-black leading-none tracking-wide text-foreground">
            ATTACK<span className="text-primary/90">LENS</span>
          </h1>
          <p className="hidden sm:block text-[11px] font-medium text-muted-foreground/80 mt-1 tracking-wide">
            Know the Weakness. Find the Path.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm" className="border border-border/60 hover:bg-accent/50 hover:text-accent-foreground rounded-md transition-colors h-8 px-3 text-xs font-semibold gap-2" title="View source code, releases and documentation">
          <a href="https://github.com/sohamgodbole28/AttackLens" target="_blank" rel="noopener noreferrer">
            <GitBranch className="h-3.5 w-3.5" />
            View on GitHub ↗
          </a>
        </Button>
      </div>
    </header>
  );
}
