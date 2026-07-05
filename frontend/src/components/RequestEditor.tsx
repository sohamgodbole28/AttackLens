import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { analyzeRequest, Match } from "@/api/client";
import { Code2, Braces, Target, Lock } from "lucide-react";
import { useHighlight } from "@/contexts/HighlightContext";
import { motion } from "framer-motion";
import { getCategoryBgColor, getIndicatorCategory } from "@/lib/utils";

interface RequestEditorProps {
  onAnalyzeStart: () => void;
  onAnalyzeSuccess: (data: any) => void;
  onAnalyzeError: (err: string) => void;
  isLoading: boolean;
}

const HighlightedText = ({ content, matches, category }: { content: string, matches: Match[], category: string }) => {
  const highlightColor = getCategoryBgColor(category);
  
  const segments = useMemo(() => {
    if (!matches || matches.length === 0 || !content) return [{ text: content, highlight: false }];
    
    // Extract unique non-empty match strings
    const matchStrings = Array.from(new Set(matches.map(m => m.matched_value).filter(Boolean)));
    if (matchStrings.length === 0) return [{ text: content, highlight: false }];

    // Find all occurrences
    const occurrences: { start: number; end: number }[] = [];
    matchStrings.forEach(matchStr => {
      let startIndex = 0;
      while ((startIndex = content.indexOf(matchStr, startIndex)) !== -1) {
        occurrences.push({ start: startIndex, end: startIndex + matchStr.length });
        startIndex += matchStr.length;
      }
    });

    if (occurrences.length === 0) return [{ text: content, highlight: false }];

    // Sort and merge overlapping occurrences
    occurrences.sort((a, b) => a.start - b.start);
    const merged: { start: number; end: number }[] = [occurrences[0]];
    for (let i = 1; i < occurrences.length; i++) {
      const last = merged[merged.length - 1];
      const current = occurrences[i];
      if (current.start <= last.end) {
        last.end = Math.max(last.end, current.end);
      } else {
        merged.push(current);
      }
    }

    // Create segments
    const result: { text: string; highlight: boolean; isFirstHighlight?: boolean }[] = [];
    let lastEnd = 0;
    let firstHighlightFound = false;

    merged.forEach(span => {
      if (span.start > lastEnd) {
        result.push({ text: content.slice(lastEnd, span.start), highlight: false });
      }
      result.push({ 
        text: content.slice(span.start, span.end), 
        highlight: true,
        isFirstHighlight: !firstHighlightFound 
      });
      firstHighlightFound = true;
      lastEnd = span.end;
    });

    if (lastEnd < content.length) {
      result.push({ text: content.slice(lastEnd), highlight: false });
    }

    return result;
  }, [content, matches]);

  return (
    <>
      {segments.map((seg, i) => (
        <span 
          key={i} 
          id={seg.isFirstHighlight ? "first-highlight" : undefined}
          className={seg.highlight ? `rounded-sm transition-colors duration-300 ${highlightColor}` : ""}
        >
          {seg.text}
        </span>
      ))}
      <br />
    </>
  );
};

export function RequestEditor({ onAnalyzeStart, onAnalyzeSuccess, onAnalyzeError, isLoading }: RequestEditorProps) {
  const [mode, setMode] = useState<"raw" | "json">("raw");
  const [content, setContent] = useState("");
  const { matches, indicatorId } = useHighlight();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    if (matches.length > 0 && overlayRef.current) {
      // Small delay to allow render
      setTimeout(() => {
        const firstHighlight = overlayRef.current?.querySelector("#first-highlight");
        if (firstHighlight && textareaRef.current) {
          const topPos = (firstHighlight as HTMLElement).offsetTop;
          textareaRef.current.scrollTo({ top: Math.max(0, topPos - 40), behavior: "smooth" });
        }
      }, 50);
    }
  }, [matches]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (!isLoading && content.trim()) {
          handleAnalyze();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content, isLoading]);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    onAnalyzeStart();
    try {
      let payloadData: any = content;
      if (mode === "json") {
        try {
          const parsed = JSON.parse(content);
          if (!parsed.method && !parsed.path && parsed.body === undefined && Object.keys(parsed).length > 0) {
            payloadData = {
              method: "POST",
              path: "/api/endpoint",
              headers: { "content-type": "application/json" },
              body: parsed
            };
          } else {
            payloadData = parsed;
          }
        } catch (e) {
          onAnalyzeError("Invalid JSON format");
          return;
        }
      }
      
      const res = await analyzeRequest({
        format: mode,
        data: payloadData
      });
      onAnalyzeSuccess(res);
    } catch (err: any) {
      onAnalyzeError(err.response?.data?.detail || "Backend Offline or Server Error");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0D1117] rounded-xl border border-border/40 overflow-hidden shadow-xl">
      <div className="p-5 border-b border-border/30 bg-[#161B22]/50">
        <h2 className="text-[13px] font-bold tracking-widest uppercase text-foreground/90">REQUEST</h2>
        <p className="text-xs text-muted-foreground mt-1.5 opacity-80">Paste your HTTP request below</p>
        
        <div className="flex bg-[#0B0F14] border border-border/50 rounded-md gap-1 mt-4 p-1 w-fit">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMode("raw")}
            className={`h-7 rounded-sm font-semibold text-[11px] px-3 gap-1.5 transition-colors ${mode === "raw" ? "bg-muted/60 text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Code2 className="h-3.5 w-3.5" />
            Raw HTTP
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMode("json")}
            className={`h-7 rounded-sm font-semibold text-[11px] px-3 gap-1.5 transition-colors ${mode === "json" ? "bg-muted/60 text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Braces className="h-3.5 w-3.5" />
            JSON
          </Button>
        </div>
      </div>
      
      <div className="flex-1 bg-[#0A0D12] overflow-hidden relative group">
        <div 
          ref={overlayRef}
          className="absolute inset-0 p-5 text-foreground/90 font-mono text-[13px] whitespace-pre-wrap break-words leading-[1.6] pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <HighlightedText content={content} matches={matches} category={indicatorId ? getIndicatorCategory(indicatorId) : "default"} />
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onScroll={handleScroll}
          placeholder={mode === "raw" ? "GET /api/users/15/profile HTTP/1.1\nHost: target.com\n..." : "{\n  \"view\": \"full\"\n}"}
          className="absolute inset-0 w-full h-full bg-transparent p-5 text-transparent caret-white font-mono text-[13px] resize-none focus:outline-none placeholder:text-muted-foreground/30 leading-[1.6]"
          spellCheck={false}
        />
      </div>

      <div className="p-4 bg-[#161B22]/50 border-t border-border/30">
        <motion.div whileHover={{ scale: 0.99 }} whileTap={{ scale: 0.98 }}>
          <Button 
            size="lg" 
            className="w-full h-12 rounded-lg font-bold bg-[#E92B54] hover:bg-[#E92B54]/90 text-white shadow-lg shadow-primary/20 transition-colors gap-2 text-[13px] tracking-wide"
            onClick={handleAnalyze}
            disabled={isLoading || !content.trim()}
          >
            <Target className="h-4 w-4" />
            {isLoading ? "ANALYZING..." : "ANALYZE REQUEST"}
          </Button>
        </motion.div>
        <div className="flex items-center justify-center gap-1.5 mt-3 text-muted-foreground">
          <Lock className="h-3 w-3 opacity-60" />
          <p className="text-[10px] opacity-70">Your request is never stored. Analysis happens in real-time.</p>
        </div>
      </div>
    </div>
  );
}
