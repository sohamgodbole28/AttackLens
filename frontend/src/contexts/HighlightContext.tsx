import React, { createContext, useContext, useState, ReactNode } from "react";
import { Match } from "@/api/client";

interface HighlightState {
  matches: Match[];
  indicatorId: string;
  setHighlights: (matches: Match[], id: string) => void;
  clearHighlights: () => void;
}

const HighlightContext = createContext<HighlightState | undefined>(undefined);

export const HighlightProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [indicatorId, setIndicatorId] = useState<string>("");

  const setHighlights = (newMatches: Match[], id: string) => {
    setMatches(newMatches);
    setIndicatorId(id);
  };

  const clearHighlights = () => {
    setMatches([]);
    setIndicatorId("");
  };

  return (
    <HighlightContext.Provider value={{ matches, indicatorId, setHighlights, clearHighlights }}>
      {children}
    </HighlightContext.Provider>
  );
};

export const useHighlight = () => {
  const context = useContext(HighlightContext);
  if (context === undefined) {
    throw new Error("useHighlight must be used within a HighlightProvider");
  }
  return context;
};
