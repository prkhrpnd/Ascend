import React from "react";

interface SimulationBadgeProps {
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function SimulationBadge({ label = "SIMULATED", size = "sm", className = "" }: SimulationBadgeProps) {
  const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider font-semibold rounded-full border border-vermilion/30 bg-vermilion/10 text-vermilion ${sizeClasses} ${className}`}
      title="This component is simulated for demonstration and regulatory compliance. Ascend does not hold customer funds or decide banking licenses."
    >
      <span className="w-1.5 h-1.5 rounded-full bg-vermilion animate-pulse" />
      {label}
    </span>
  );
}
