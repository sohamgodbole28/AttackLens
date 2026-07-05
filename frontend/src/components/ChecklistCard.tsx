import { useState, useEffect, useRef } from "react";
import { Recommendation, apiClient } from "@/api/client";
import { AlertCircle, ChevronRight, ChevronDown } from "lucide-react";
import { getConfidenceColor } from "@/lib/utils";

export function ChecklistCard({ recommendation, defaultOpen = false }: { recommendation: Recommendation, defaultOpen?: boolean }) {
  const [checklist, setChecklist] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        if (isHovered || (containerRef.current && containerRef.current.contains(document.activeElement))) {
          setOpen(false);
          e.stopImmediatePropagation();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isHovered]);

  useEffect(() => {
    if (!open || checklist || loading || error) return;
    const fetchChecklist = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/knowledge/checklists/${recommendation.checklist_identifier}`);
        setChecklist(res.data);
      } catch (e: any) {
        if (e.response?.status === 404) {
          setError(`Checklist '${recommendation.checklist_identifier}' not found.`);
        } else {
          setError("Failed to load checklist. Network error.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchChecklist();
  }, [open, recommendation.checklist_identifier, checklist, loading, error]);

  if (!recommendation.checklist_identifier) return null;

  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="border border-border/20 rounded-lg bg-[#0B0F14] shadow-sm overflow-hidden transition-all"
    >
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 px-5 py-4 hover:bg-[#161B22]/50 transition-colors text-left"
      >
        <div className="mt-0.5">
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div>
          <h3 className="text-[14px] font-bold text-foreground/90">{recommendation.vulnerability}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getConfidenceColor(recommendation.confidence)}`}>
              {recommendation.confidence} RISK
            </span>
            <span className="text-[10px] text-muted-foreground font-mono font-bold tracking-widest uppercase">
              • Score {recommendation.score}
            </span>
          </div>
        </div>
      </button>

      {open && (
        <div className="p-5 border-t border-border/20 bg-[#0A0D12]/50">
          {loading && <p className="text-xs text-muted-foreground animate-pulse">Loading checklist...</p>}
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-md text-sm font-medium">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {checklist && (
            <div className="space-y-6">
              {checklist.categories.map((cat: any, idx: number) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">{cat.name}</h4>
                  <div className="space-y-4 pl-2 border-l border-border/40">
                    {cat.tests.map((test: any) => (
                      <label key={test.id} className="flex items-start gap-3 cursor-pointer group ml-3">
                        <input type="checkbox" className="mt-[3px] shrink-0 h-3.5 w-3.5 rounded-sm border border-border focus:ring-primary accent-[#E92B54] bg-[#0B0F14]" />
                        <div className="flex flex-col gap-1">
                           <span className="text-[13px] text-foreground/90 font-medium group-hover:text-foreground transition-colors leading-relaxed">{test.title}</span>
                           <span className="text-[11.5px] text-muted-foreground opacity-80 leading-relaxed">{test.objective}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
