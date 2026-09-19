import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, icon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[#594E46] uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-[#9C8F84] pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-[#EADBCE] bg-white px-3.5 py-2.5 text-sm text-[#2F2924] placeholder-[#A89C92] transition-colors focus:border-[#D97745] focus:outline-none focus:ring-2 focus:ring-[#D97745]/20 disabled:bg-[#F7F2EB] disabled:cursor-not-allowed",
              icon ? "pl-10" : "",
              error ? "border-[#C04838] focus:border-[#C04838] focus:ring-[#C04838]/20" : "",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[#C04838] mt-0.5">{error}</p>}
        {helper && !error && <p className="text-xs text-[#8C8075] mt-0.5">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helper, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-semibold text-[#594E46] uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-[#EADBCE] bg-white px-3.5 py-2.5 text-sm text-[#2F2924] placeholder-[#A89C92] transition-colors focus:border-[#D97745] focus:outline-none focus:ring-2 focus:ring-[#D97745]/20 disabled:bg-[#F7F2EB] disabled:cursor-not-allowed min-h-[90px]",
            error ? "border-[#C04838] focus:border-[#C04838] focus:ring-[#C04838]/20" : "",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#C04838] mt-0.5">{error}</p>}
        {helper && !error && <p className="text-xs text-[#8C8075] mt-0.5">{helper}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: Array<{ label: string; value: string | number }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helper, options, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-[#594E46] uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-[#EADBCE] bg-white px-3.5 py-2.5 text-sm text-[#2F2924] transition-colors focus:border-[#D97745] focus:outline-none focus:ring-2 focus:ring-[#D97745]/20 disabled:bg-[#F7F2EB] disabled:cursor-not-allowed cursor-pointer",
            error ? "border-[#C04838] focus:border-[#C04838] focus:ring-[#C04838]/20" : "",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[#C04838] mt-0.5">{error}</p>}
        {helper && !error && <p className="text-xs text-[#8C8075] mt-0.5">{helper}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
