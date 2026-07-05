import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { RequestEditor } from '@/components/RequestEditor'
import { AnalysisResults } from '@/components/AnalysisResults'
import { StartupScreen } from '@/components/StartupScreen'
import { AnalyzeResponse } from '@/api/client'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { CheckCircle2, CircleDashed } from 'lucide-react'

const PIPELINE_STAGES = [
  "Parsing Request",
  "Detecting Indicators",
  "Matching Rules",
  "Calculating Scores",
  "Loading Recommendations",
  "Preparing Checklist",
  "Done"
];

function LivePipeline({ data }: { data: AnalyzeResponse | null }) {
  const [activeStage, setActiveStage] = useState(0);
  const indCount = useMotionValue(0);
  const indRounded = useTransform(indCount, Math.round);
  const ruleCount = useMotionValue(0);
  const ruleRounded = useTransform(ruleCount, Math.round);

  useEffect(() => {
    let stage = 0;
    const interval = setInterval(() => {
      stage += 1;
      if (stage < PIPELINE_STAGES.length) {
        setActiveStage(stage);
      } else {
        clearInterval(interval);
      }
    }, 310);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (data) {
      animate(indCount, data.detected_indicators.length, { duration: 1.0, ease: "easeOut" });
      animate(ruleCount, data.rule_results.length, { duration: 1.0, delay: 0.2, ease: "easeOut" });
    }
  }, [data, indCount, ruleCount]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground relative">
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isActive = idx === activeStage;
          const isDone = idx < activeStage;
          const isPending = idx > activeStage;
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-3 ${isActive ? 'text-primary' : isDone ? 'text-foreground/80' : 'text-muted-foreground/50'}`}
            >
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : isActive ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              ) : (
                <CircleDashed className="h-4 w-4 opacity-30" />
              )}
              <span className="text-[13px] font-mono tracking-tight font-medium uppercase">{stage}</span>
            </motion.div>
          );
        })}
      </div>

      {data && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-6 text-right"
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Indicators Found</div>
            <motion.div className="text-3xl font-black text-foreground">{indRounded}</motion.div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Rules Triggered</div>
            <motion.div className="text-3xl font-black text-foreground">{ruleRounded}</motion.div>
          </div>
        </motion.div>
      )}
      
      {/* Radar sweep effect */}
      <motion.div 
        initial={{ left: "-10%" }}
        animate={{ left: "110%" }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 bottom-0 w-[20%] bg-gradient-to-r from-transparent via-[#E92B54]/5 to-transparent pointer-events-none"
      />
    </div>
  );
}

function App() {
  const [results, setResults] = useState<AnalyzeResponse | null>(null);
  const [pendingResults, setPendingResults] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startupComplete, setStartupComplete] = useState(false);

  const handleAnalyzeStart = () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setPendingResults(null);
  };

  const handleAnalyzeSuccess = (data: AnalyzeResponse) => {
    setPendingResults(data);
  };

  useEffect(() => {
    if (pendingResults && loading) {
      const timer = setTimeout(() => {
        setResults(pendingResults);
        setLoading(false);
        setPendingResults(null);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [pendingResults, loading]);

  const handleAnalyzeError = (err: string) => {
    setLoading(false);
    setError(err);
  };

  return (
    <>
      <StartupScreen onComplete={() => setStartupComplete(true)} />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: startupComplete ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 relative overflow-hidden"
      >
      <Header />
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-6 lg:gap-8 z-10">
        
        {/* Left Column: Request Input */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-[100px] h-[50vh] lg:h-[calc(100vh-140px)] min-h-[400px]">
          <RequestEditor 
            onAnalyzeStart={handleAnalyzeStart}
            onAnalyzeSuccess={handleAnalyzeSuccess}
            onAnalyzeError={handleAnalyzeError}
            isLoading={loading}
          />
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-6 relative">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 border border-destructive/20 bg-destructive/5 text-destructive rounded-xl font-medium text-sm flex gap-3 items-start"
              >
                <span className="flex h-5 w-5 rounded-full bg-destructive items-center justify-center text-destructive-foreground text-xs font-black shrink-0 mt-0.5">!</span>
                <div>
                  <h3 className="font-semibold mb-1">Analysis Failed</h3>
                  <p className="opacity-90">{error}</p>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex"
              >
                <LivePipeline data={pendingResults} />
              </motion.div>
            )}

            {!results && !loading && !error && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-24 text-center text-muted-foreground border border-dashed border-border/40 rounded-xl bg-[#0A0D12]/30"
              >
                <p className="font-semibold text-lg text-foreground/70">Ready for Analysis</p>
                <p className="text-sm mt-2 opacity-70">Paste your request on the left and click Analyze.</p>
              </motion.div>
            )}

            {results && !loading && (
              <motion.div key="results">
                <AnalysisResults data={results} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      </motion.div>
    </>
  )
}

export default App
