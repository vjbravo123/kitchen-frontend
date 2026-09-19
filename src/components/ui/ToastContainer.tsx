"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { removeToast } from "@/lib/redux/slices/uiSlice";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.ui.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-[#6F8F5F] shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-[#E7B86A] shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-[#D97745] shrink-0" />,
          info: <Info className="w-5 h-5 text-[#8B5E3C] shrink-0" />,
        };

        const borders = {
          success: "border-l-4 border-l-[#6F8F5F]",
          warning: "border-l-4 border-l-[#E7B86A]",
          error: "border-l-4 border-l-[#D97745]",
          info: "border-l-4 border-l-[#8B5E3C]",
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-white/95 backdrop-blur-md rounded-xl border border-[#EADBCE] shadow-lg ${borders[t.type]} transition-all animate-in fade-in slide-in-from-bottom-2`}
          >
            {icons[t.type]}
            <div className="flex-1 text-sm">
              {t.title && <h4 className="font-semibold text-[#2F2924] mb-0.5">{t.title}</h4>}
              <p className="text-[#594E46] leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => dispatch(removeToast(t.id))}
              className="text-[#9C8F84] hover:text-[#2F2924] transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
