import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getConfidenceColor(confidence: string): string {
  switch (confidence.toLowerCase()) {
    case "critical":
    case "high":
      return "text-[#E92B54] bg-[#E92B54]/10 border-[#E92B54]/30";
    case "medium":
      return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    case "low":
      return "text-blue-500 bg-blue-500/10 border-blue-500/30";
    case "success":
      return "text-[#C6FF00] bg-[#C6FF00]/10 border-[#C6FF00]/30";
    default:
      return "text-muted-foreground bg-accent border-border";
  }
}

export function getIndicatorCategory(id: string): string {
  const lower = id.toLowerCase();
  if (lower.includes("auth") || lower.includes("privileged")) return "auth";
  if (lower.includes("role") || lower.includes("user")) return "role";
  if (lower.includes("object") || lower.includes("id")) return "object_id";
  if (lower.includes("multipart") || lower.includes("data") || lower.includes("sensitive")) return "multipart";
  if (lower.includes("json") || lower.includes("response")) return "json";
  return "default";
}

export function getCategoryBgColor(category: string): string {
  switch (category) {
    case "auth": return "bg-red-500/20 outline outline-1 outline-red-500/50 text-red-100";
    case "object_id": return "bg-yellow-500/20 outline outline-1 outline-yellow-500/50 text-yellow-100";
    case "multipart": return "bg-blue-500/20 outline outline-1 outline-blue-500/50 text-blue-100";
    case "role": return "bg-orange-500/20 outline outline-1 outline-orange-500/50 text-orange-100";
    case "json": return "bg-gray-500/20 outline outline-1 outline-gray-500/50 text-gray-100";
    default: return "bg-primary/20 outline outline-1 outline-primary/50 text-primary-foreground";
  }
}

export function getCategoryTextColor(category: string): string {
  switch (category) {
    case "auth": return "text-red-500";
    case "object_id": return "text-yellow-500";
    case "multipart": return "text-blue-500";
    case "role": return "text-orange-500";
    case "json": return "text-gray-500";
    default: return "text-primary";
  }
}
