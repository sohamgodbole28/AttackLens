import { useEffect, useState } from "react";
import { RuleResult, DetectedIndicator } from "@/api/client";
import { getConfidenceColor, getIndicatorCategory, getCategoryTextColor, getCategoryBgColor } from "@/lib/utils";
import { useHighlight } from "@/contexts/HighlightContext";
import { motion, useMotionValue, animate } from "framer-motion";

export function RuleCard({ result, indicators, delay = 0 }: { result: RuleResult, indicators: DetectedIndicator[], delay?: number }) {
  const percentage = Math.min(100, Math.max(0, result.score));
  const { setHighlights, clearHighlights, indicatorId } = useHighlight();
  const count = useMotionValue(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const animation = animate(count, percentage, { 
      duration: 0.6, 
      delay: delay + 0.1, 
      ease: "easeOut",
      onUpdate: (latest) => setDisplayScore(Math.round(latest))
    });
    return animation.stop;
  }, [percentage, delay]);
  
  const handleIndicatorClick = (id: string) => {
    if (indicatorId === id) {
      clearHighlights();
    } else {
      const ind = indicators.find(i => i.id === id);
      if (ind) {
        setHighlights(ind.matches, id);
      }
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="border border-border/40 rounded-xl bg-[#0B0F14] hover:bg-[#0c1117] transition-colors shadow-sm overflow-hidden p-4 sm:p-6 flex flex-col gap-6"
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-4">
        <div className="flex-1 pr-0 sm:pr-8">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-[15px] font-bold tracking-wide text-foreground/90">{result.vulnerability}</h3>
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getConfidenceColor(result.confidence)}`}>
              {result.confidence} RISK
            </span>
          </div>
          <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed opacity-80">
            {result.explanation}
          </p>
        </div>
        <div className="flex flex-col items-end w-full sm:w-32 shrink-0 relative">
          <div className="flex items-center justify-between w-full mb-3">
             <div className="flex items-center gap-2">
               {/* Confidence Ring around score */}
               <div className="relative flex items-center justify-center w-12 h-12 rounded-full border-2 border-border/30">
                 <svg className="absolute inset-0 w-full h-full -rotate-90">
                   <motion.circle 
                     cx="22" cy="22" r="22" 
                     className={`fill-none stroke-current ${getConfidenceColor(result.confidence).split(' ')[0]}`}
                     strokeWidth="2"
                     strokeDasharray="138"
                     initial={{ strokeDashoffset: 138 }}
                     animate={{ strokeDashoffset: 138 - (138 * percentage) / 100 }}
                     transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
                   />
                 </svg>
                 <span className="text-lg font-black text-foreground">{displayScore}</span>
               </div>
               <span className="text-[10px] text-muted-foreground font-bold tracking-widest">/ 100</span>
             </div>
          </div>
          <div className="h-1.5 w-full bg-[#161B22] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
              className={`h-full ${percentage > 70 ? 'bg-[#E92B54]' : percentage > 40 ? 'bg-amber-500' : 'bg-blue-500'}`} 
            />
          </div>
        </div>
      </div>

      {result.score_breakdown && result.score_breakdown.length > 0 && (
        <div className="pt-4 border-t border-border/20 flex items-center gap-3">
           <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Matched Indicators:</span>
           <div className="flex flex-wrap gap-2">
             {result.score_breakdown.map((c, i) => {
               const cat = getIndicatorCategory(c.indicator);
               const bgClass = indicatorId === c.indicator 
                 ? getCategoryBgColor(cat)
                 : `bg-[#161B22]/50 border-border/30 hover:bg-[#1A1F26] ${getCategoryTextColor(cat)}`;
                 
               return (
                 <motion.button 
                   key={i} 
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleIndicatorClick(c.indicator)}
                   className={`flex items-center gap-1 border px-2 py-1 rounded text-[11px] font-mono transition-colors ${bgClass}`}
                 >
                   {c.indicator}
                 </motion.button>
               );
             })}
           </div>
        </div>
      )}
    </motion.div>
  );
}
