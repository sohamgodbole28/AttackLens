import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Target } from "lucide-react";

const STARTUP_STEPS = [
  "Loading Rule Engine",
  "Loading Detection Modules",
  "Loading Knowledge Base",
  "Preparing Recommendation Engine",
  "Initializing Interface",
  "Ready"
];

export function StartupScreen({ onComplete }: { onComplete: () => void }) {
  const [activeStep, setActiveStep] = useState(-1);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let currentStep = -1;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < STARTUP_STEPS.length) {
        setActiveStep(currentStep);
      }
      
      if (currentStep === STARTUP_STEPS.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFinished(true);
          setTimeout(onComplete, 400);
        }, 1000); // 1s pause after "Ready"
      }
    }, 180);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground"
        >
          <div className="flex flex-col items-center max-w-md w-full px-6">
            <motion.div 
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center mb-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-10 w-10 text-primary" strokeWidth={2.5} />
                <h1 className="text-3xl font-black leading-none tracking-wide text-foreground">
                  ATTACK<span className="text-primary/90">LENS</span>
                </h1>
              </div>
              <p className="text-[13px] font-medium text-muted-foreground/80 tracking-wide text-center">
                Know the Weakness.<br/>
                Find the Path.
              </p>
            </motion.div>

            <div className="w-full max-w-[280px] flex flex-col gap-4 mt-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-3 w-3 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-muted-foreground">Initializing Engine...</span>
              </div>
              
              <div className="space-y-3">
                {STARTUP_STEPS.map((step, idx) => {
                  const isVisible = activeStep >= idx;
                  const isCurrent = activeStep === idx;
                  const isDone = activeStep > idx;
                  
                  return (
                    <motion.div 
                      key={step}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 5 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center gap-3 text-[12px] font-mono tracking-wide ${isVisible ? (isCurrent && idx !== STARTUP_STEPS.length - 1 ? "text-foreground" : "text-muted-foreground/80") : "opacity-0"}`}
                    >
                      <Check className={`h-3.5 w-3.5 ${isDone || (idx === STARTUP_STEPS.length - 1 && isVisible) ? "text-primary" : "text-muted-foreground/40"}`} />
                      <span className={idx === STARTUP_STEPS.length - 1 && isVisible ? "text-primary font-bold" : ""}>{step}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
