import { Recommendation } from "@/api/client";
import { Shield } from "lucide-react";

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  return (
    <div className="border border-border/40 rounded-xl bg-[#0B0F14] shadow-sm overflow-hidden p-6 flex flex-col md:flex-row md:items-center gap-6 justify-between">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[#E92B54]/10 rounded-lg shrink-0 mt-1">
          <Shield className="h-6 w-6 text-[#E92B54]" />
        </div>
        <div>
          <div className="flex flex-col gap-2 mb-2">
            <h3 className="text-[15px] font-bold tracking-wide text-foreground/90">{recommendation.vulnerability}</h3>
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-[#E92B54]/30 bg-[#E92B54]/10 text-[#E92B54] w-fit`}>
              {recommendation.confidence} CONFIDENCE
            </span>
          </div>
          <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed opacity-80">
            {recommendation.explanation || `Review the request for potential ${recommendation.vulnerability.toLowerCase()} vectors.`}
          </p>
        </div>
      </div>
      
    </div>
  );
}
