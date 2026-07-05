import { useState, useRef, useEffect } from "react";
import { DetectedIndicator } from "@/api/client";
import { Lock, Box, User, AlertCircle } from "lucide-react";
import { cn, getIndicatorCategory, getCategoryTextColor } from "@/lib/utils";
import { useHighlight } from "@/contexts/HighlightContext";
import { motion, AnimatePresence } from "framer-motion";

const indicatorNameMap: Record<string, string> = {
  object_identifier: "Object Identifier",
  privileged_endpoint: "Privileged Endpoint",
  role_parameter: "Role Parameter",
  authentication: "Authentication",
  json_response: "JSON Response",
};

const categoryMap: Record<string, string> = {
  path_segments: "Endpoint Components",
  value_patterns: "Numeric Identifiers",
  parameters: "Query Parameters",
  body_keys: "Body Parameters",
  headers: "Headers",
  cookies: "Cookies",
};

function getIndicatorIcon(id: string) {
  const category = getIndicatorCategory(id);
  const colorClass = getCategoryTextColor(category);
  
  switch (category) {
    case "auth": return <Lock className={`h-3.5 w-3.5 ${colorClass}`} />;
    case "role": return <User className={`h-3.5 w-3.5 ${colorClass}`} />;
    case "object_id": return <Box className={`h-3.5 w-3.5 ${colorClass}`} />;
    case "multipart": return <Lock className={`h-3.5 w-3.5 ${colorClass}`} />;
    case "json": return <Box className={`h-3.5 w-3.5 ${colorClass}`} />;
    default: return <AlertCircle className={`h-3.5 w-3.5 ${colorClass}`} />;
  }
}

export function IndicatorCard({ indicator, delay = 0 }: { indicator: DetectedIndicator, delay?: number }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setHighlights, clearHighlights, indicatorId } = useHighlight();

  // If another indicator is clicked, close this one
  useEffect(() => {
    if (open && indicatorId !== indicator.id && indicatorId !== "") {
      setOpen(false);
    }
  }, [indicatorId, open, indicator.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (open) {
          setOpen(false);
          clearHighlights();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [containerRef, open, clearHighlights]);
  
  const friendlyName = indicatorNameMap[indicator.id] || indicator.id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  type GroupedMatch = { value: string; sources: Set<string> };
  const groupedMatches: Record<string, GroupedMatch[]> = {};

  indicator.matches.forEach(match => {
    const rawRule = match.matched_rule || "unknown";
    const categoryName = categoryMap[rawRule] || rawRule.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    if (!groupedMatches[categoryName]) {
      groupedMatches[categoryName] = [];
    }
    
    const existing = groupedMatches[categoryName].find(g => g.value === match.matched_value);
    if (existing) {
      if (match.source) existing.sources.add(match.source);
    } else {
      groupedMatches[categoryName].push({
        value: match.matched_value,
        sources: new Set(match.source ? [match.source] : [])
      });
    }
  });

  const handleToggle = () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (newOpen) {
      setHighlights(indicator.matches, indicator.id);
    } else {
      clearHighlights();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, delay, ease: "easeOut" }}
      className={cn("relative group transition-all duration-200", open ? "w-full" : "w-auto")} 
      ref={containerRef}
    >
      <motion.button 
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleToggle}
        className={cn(
          "w-full flex items-center gap-2.5 px-4 py-2 rounded-md border border-border/60 transition-all text-left focus:outline-none focus:ring-1 focus:ring-primary/50",
          open ? "bg-[#161B22] border-primary/40 shadow-sm" : "bg-[#0B0F14] hover:bg-[#161B22]"
        )}
      >
        {getIndicatorIcon(indicator.id)}
        <span className="text-[13px] font-medium text-foreground/90">{friendlyName}</span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="mt-3 w-full p-5 rounded-lg border border-border/40 bg-[#12161D] text-sm shadow-lg overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5 border-b border-border/30 pb-3">
               <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Confidence</span>
               <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">{indicator.confidence}</span>
            </div>
            
            <div className="space-y-6">
              {Object.entries(groupedMatches).map(([category, items], i) => (
                <div key={i} className="flex flex-col gap-2.5 pl-2.5 border-l-2 border-primary/30 relative">
                  <div className="flex items-center gap-2 -ml-[15px] bg-[#12161D] w-fit pr-3 py-0.5">
                    <span className="h-2 w-2 rounded-full bg-primary/80 ring-4 ring-[#12161D]" />
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{category}</span>
                  </div>
                  
                  <div className="pl-1 space-y-2 mt-1">
                    {items.map((item, j) => (
                      <div key={j} className="flex items-center flex-wrap gap-2.5">
                        <span className="text-[13px] text-foreground/90 font-mono bg-[#1A1F26] px-2.5 py-1 rounded-md border border-border/30 shadow-sm">
                          {item.value}
                        </span>
                        {item.sources.size > 0 && (
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {Array.from(item.sources).map(s => (
                              <span key={s} className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground/80 bg-[#0B0F14] px-1.5 py-0.5 rounded border border-border/20">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
