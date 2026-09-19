"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wheat,
  Boxes,
  BookOpen,
  Flame,
  Settings,
  Sparkles,
  HeartPulse,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen } = useAppSelector((state) => state.ui);
  const { lowStockItems } = useAppSelector((state) => state.inventory);
  const { items: recipes } = useAppSelector((state) => state.recipes);

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Ingredients & Pantry",
      href: "/ingredients",
      icon: Wheat,
    },
    {
      name: "Inventory & Stock",
      href: "/inventory",
      icon: Boxes,
      badge: lowStockItems.length > 0 ? `${lowStockItems.length} alert` : undefined,
      badgeType: "warning",
    },
    {
      name: "Recipes & Costing",
      href: "/recipes",
      icon: BookOpen,
      badge: recipes.length > 0 ? `${recipes.length}` : undefined,
      badgeType: "neutral",
    },
    {
      name: "Production & Cooking",
      href: "/production",
      icon: Flame,
    },
    {
      name: "Settings & Profile",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-[#FDFBF7] border-r border-[#EADBCE] flex flex-col transition-all duration-300 ease-in-out lg:static lg:translate-x-0 pt-16 lg:pt-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand Header for Desktop */}
      <div className="h-16 px-6 border-b border-[#EADBCE] hidden lg:flex items-center gap-3 bg-[#FAF6F0]">
        <div className="w-8 h-8 rounded-lg bg-[#8B5E3C] flex items-center justify-center text-white shadow-sm">
          <Wheat className="w-4 h-4 text-[#E7B86A]" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-base text-[#2F2924]">Pantry & Math</h2>
          <p className="text-[10px] text-[#766B62] uppercase tracking-wider font-semibold">Kitchen Costing</p>
        </div>
      </div>

      {/* Navigation items */}
      <div className="flex-1 px-4 py-6 overflow-y-auto flex flex-col gap-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold text-[#8C8075] uppercase tracking-wider">
          Kitchen Workspace
        </div>

        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#8B5E3C] text-white shadow-sm font-semibold"
                  : "text-[#594E46] hover:bg-[#EFE8DE]/70 hover:text-[#2F2924]"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-[#E7B86A]" : "text-[#766B62] group-hover:text-[#8B5E3C]"
                  )}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                    isActive
                      ? "bg-white/20 text-white"
                      : item.badgeType === "warning"
                      ? "bg-[#FEF9F0] text-[#A07324] border border-[#E7B86A]/40"
                      : "bg-[#F3ECE2] text-[#6E492E]"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Kitchen Philosophy / Warm Pro Tip Card */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-[#FAF6F0] to-[#F5EFEB] border border-[#EADBCE]/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8B5E3C] mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#D97745]" />
          <span>Real-time Math</span>
        </div>
        <p className="text-[11px] text-[#766B62] leading-relaxed">
          Recipe costs and batch margins automatically adjust when ingredient purchase prices change.
        </p>
      </div>
    </aside>
  );
}
