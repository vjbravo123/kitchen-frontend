import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary" // Terracotta CTA
    | "secondary" // Warm Brown
    | "outline"
    | "ghost"
    | "success" // Sage Green
    | "honey" // Golden Honey
    | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[#D97745] hover:bg-[#C56434] text-white shadow-sm hover:shadow-md hover:shadow-[#D97745]/20 focus:ring-[#D97745]/50",
      secondary:
        "bg-[#8B5E3C] hover:bg-[#724B2D] text-white shadow-sm hover:shadow-md hover:shadow-[#8B5E3C]/20 focus:ring-[#8B5E3C]/50",
      outline:
        "border border-[#EADBCE] bg-white/70 hover:bg-[#FAF6F0] text-[#2F2924] hover:border-[#D9C4B0] focus:ring-[#8B5E3C]/30",
      ghost:
        "hover:bg-[#EFE8DE]/60 text-[#2F2924] hover:text-[#8B5E3C] focus:ring-[#8B5E3C]/20",
      success:
        "bg-[#6F8F5F] hover:bg-[#5C7A4D] text-white shadow-sm hover:shadow-[#6F8F5F]/20 focus:ring-[#6F8F5F]/50",
      honey:
        "bg-[#E7B86A] hover:bg-[#D5A454] text-[#2F2924] font-semibold shadow-sm focus:ring-[#E7B86A]/50",
      danger:
        "bg-[#C04838] hover:bg-[#A83729] text-white shadow-sm focus:ring-[#C04838]/50",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
      md: "text-sm px-4 py-2 h-10 gap-2",
      lg: "text-base px-6 py-2.5 h-12 gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
