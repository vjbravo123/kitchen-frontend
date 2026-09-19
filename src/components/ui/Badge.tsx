import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "accent" | "primary" | "muted" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    success: "bg-[#F0F6EE] text-[#466537] border-[#6F8F5F]/30",
    warning: "bg-[#FEF9F0] text-[#9A6F20] border-[#E7B86A]/40",
    accent: "bg-[#FDF1EA] text-[#B05223] border-[#D97745]/30",
    primary: "bg-[#F5EFEB] text-[#6E492E] border-[#8B5E3C]/30",
    muted: "bg-[#F3ECE2] text-[#685E55] border-[#EADBCE]",
    outline: "bg-transparent text-[#594E46] border-[#D9C8B5]",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium rounded-md",
    md: "text-xs px-2.5 py-1 font-medium rounded-lg",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
