import { useState, useEffect, useRef } from "react";
import { Recommendation, apiClient } from "@/api/client";
import { AlertCircle, ChevronRight, ChevronDown } from "lucide-react";
import { getConfidenceColor } from "@/lib/utils";

export function ReferenceCard({ recommendation, defaultOpen = false }: { recommendation: Recommendation, defaultOpen?: boolean }) {
  const [reference, setReference] = useState<any>(null);
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
    if (!open || reference || loading || error) return;
    const fetchReference = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/knowledge/references/${recommendation.reference_identifier}`);
        setReference(res.data);
      } catch (e: any) {
        if (e.response?.status === 404) {
          setError(`Reference '${recommendation.reference_identifier}' not found.`);
        } else {
          setError("Failed to load references. Network error.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReference();
  }, [open, recommendation.reference_identifier, reference, loading, error]);

  if (!recommendation.reference_identifier) return null;

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
          {loading && <p className="text-xs text-muted-foreground animate-pulse">Loading references...</p>}
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-md text-sm font-medium">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {reference && (
            <div className="space-y-6">
              {Object.entries(reference.resources).map(([category, resources]: [string, any], idx: number) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">{category}</h4>
                  <div className="space-y-3">
                    {resources.map((link: any, i: number) => (
                      <div key={i} className="block p-4 border border-border/40 rounded-lg bg-[#0B0F14]">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-[13px] font-semibold text-foreground/90">{link.title}</h4>
                            <p className="text-[12px] text-muted-foreground mt-1.5 font-mono opacity-80 break-all">{link.source}</p>
                            {link.type && <p className="text-[11px] font-mono text-muted-foreground mt-1.5 opacity-80 uppercase tracking-widest">{link.type}</p>}
                          </div>
                        </div>
                      </div>
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
