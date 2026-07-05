import { useState, useEffect, useRef } from "react";
import { AnalyzeResponse } from "@/api/client";
import { IndicatorCard } from "./IndicatorCard";
import { RuleCard } from "./RuleCard";
import { RecommendationCard } from "./RecommendationCard";
import { ChecklistCard } from "./ChecklistCard";
import { ReferenceCard } from "./ReferenceCard";
import { Sparkles, ChevronDown, CheckCircle2, ShieldCheck, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Section({ title, count, defaultOpen, delay = 0, children }: { title: string, count: number, defaultOpen?: boolean, delay?: number, children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        if (isHovered || (containerRef.current && containerRef.current.contains(document.activeElement))) {
          setOpen(false);
          e.stopPropagation();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isHovered]);

  return (
    <motion.div 
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="border border-border/40 rounded-xl bg-[#0D1117] shadow-sm overflow-hidden transition-all"
    >
      <motion.button 
        whileHover={{ backgroundColor: "rgba(22, 27, 34, 0.6)" }}
        whileTap={{ scale: 0.995 }}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 bg-[#161B22]/30 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-primary/50"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-[13px] font-bold tracking-widest uppercase text-foreground/90">{title}</h2>
          {count > 0 && <span className="bg-[#161B22] border border-border/50 px-2.5 py-0.5 rounded text-[11px] font-mono text-muted-foreground font-semibold">{count}</span>}
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </motion.button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-border/30 bg-[#0A0D12]/30"
          >
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const SummaryCard = ({ label, value, delay = 0 }: { label: string, value: string | number, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay, ease: "easeOut" }}
    className="flex flex-col items-center justify-center p-3 bg-[#161B22]/50 border border-border/40 rounded-lg shadow-sm"
  >
    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{label}</span>
    <span className="text-sm font-mono font-bold text-foreground/90">{value}</span>
  </motion.div>
);

export function AnalysisResults({ data }: { data: AnalyzeResponse }) {
  const [cascadeDone, setCascadeDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCascadeDone(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const sortedRules = [...data.rule_results].sort((a, b) => b.score - a.score);
  const sortedRecommendations = [...data.recommendations].sort((a, b) => b.score - a.score);

  const checklists = sortedRecommendations.filter(r => r.checklist_identifier);
  const references = sortedRecommendations.filter(r => r.reference_identifier);

  const pReq = data.parsed_request;
  const numParams = Object.keys(pReq.query_params || {}).length;
  const numBodyKeys = typeof pReq.body === 'object' && pReq.body !== null ? Object.keys(pReq.body).length : (pReq.body ? 1 : 0);
  const numCookies = Object.keys(pReq.cookies || {}).length;
  const numHeaders = Object.keys(pReq.headers || {}).length;

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-4 px-2"
      >
        <Sparkles className="h-5 w-5 text-[#E92B54]" />
        <div>
          <h2 className="text-[15px] font-bold tracking-widest uppercase">ANALYSIS RESULTS</h2>
          <p className="text-[11px] text-muted-foreground opacity-80 mt-0.5 uppercase tracking-wider">AttackLens has analyzed your request.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <SummaryCard label="Method" value={pReq.method || "N/A"} delay={0.0} />
        <SummaryCard label="Headers" value={numHeaders} delay={cascadeDone ? 0 : 0.05} />
        <SummaryCard label="Cookies" value={numCookies} delay={cascadeDone ? 0 : 0.1} />
        <SummaryCard label="Params" value={numParams} delay={cascadeDone ? 0 : 0.15} />
        <SummaryCard label="Body" value={numBodyKeys} delay={cascadeDone ? 0 : 0.2} />
        <SummaryCard label="Rules" value={data.rule_results.length} delay={cascadeDone ? 0 : 0.25} />
      </div>

      <div className="space-y-4">
        <Section title="DETECTED INDICATORS" count={data.detected_indicators.length} defaultOpen delay={cascadeDone ? 0 : 0.4}>
          <div className="flex flex-wrap gap-3">
            {data.detected_indicators.map((ind, idx) => (
              <IndicatorCard key={ind.id} indicator={ind} delay={cascadeDone ? 0 : 0.6 + idx * 0.15} />
            ))}
            {data.detected_indicators.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground/70 bg-[#0A0D12] rounded-lg border border-dashed border-border/30">
                <ShieldCheck className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-sm font-medium">No security indicators detected.</p>
                <p className="text-[11px] opacity-70 mt-1">This request appears low-risk according to the current rule set.</p>
              </div>
            )}
          </div>
        </Section>

        <Section title="RULE EVALUATION" count={sortedRules.length} defaultOpen delay={cascadeDone ? 0 : 0.8}>
          <div className="space-y-4">
            {sortedRules.map((rule, idx) => (
              <RuleCard key={rule.rule_id} result={rule} indicators={data.detected_indicators} delay={cascadeDone ? 0 : 1.0 + idx * 0.2} />
            ))}
            {sortedRules.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground/70 bg-[#0A0D12] rounded-lg border border-dashed border-border/30">
                <CheckCircle2 className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-sm font-medium">No rules were triggered.</p>
              </div>
            )}
          </div>
        </Section>

        <Section title="RECOMMENDATIONS" count={data.recommendations.length} defaultOpen delay={cascadeDone ? 0 : 1.2}>
          <div className="space-y-4">
            {data.recommendations.map((rec, idx) => (
              <RecommendationCard key={idx} recommendation={rec} />
            ))}
            {data.recommendations.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground/70 bg-[#0A0D12] rounded-lg border border-dashed border-border/30">
                <Check className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-sm font-medium">No recommendations are required for this request.</p>
              </div>
            )}
          </div>
        </Section>

        <Section title="TESTING CHECKLIST" count={checklists.length} delay={cascadeDone ? 0 : 1.6}>
          <div className="space-y-4">
            {checklists.map((rec, idx) => <ChecklistCard key={idx} recommendation={rec} defaultOpen={idx === 0} />)}
            {checklists.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground/70 bg-[#0A0D12] rounded-lg border border-dashed border-border/30">
                <p className="text-sm font-medium">No checklists available.</p>
              </div>
            )}
          </div>
        </Section>

        <Section title="REFERENCES" count={references.length} delay={cascadeDone ? 0 : 2.0}>
          <div className="space-y-4">
            {references.map((rec, idx) => <ReferenceCard key={idx} recommendation={rec} defaultOpen={idx === 0} />)}
            {references.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground/70 bg-[#0A0D12] rounded-lg border border-dashed border-border/30">
                <p className="text-sm font-medium">No references available.</p>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
