"use client";

import React, { useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { setSidebarOpen } from "@/lib/redux/slices/uiSlice";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wheat,
  Boxes,
  BookOpen,
  Flame,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isSidebarOpen } = useAppSelector((state) => state.ui);
  const { lowStockItems } = useAppSelector((state) => state.inventory);
  const { items: recipes } = useAppSelector((state) => state.recipes);

  // Track screen size for mobile vs desktop behavior
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on mobile when navigating
  const handleNavClick = useCallback(() => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  }, [isMobile, dispatch]);

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

  const isCollapsed = !isSidebarOpen && !isMobile;

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <div
        className={cn("sidebar-overlay lg:hidden", isMobile && isSidebarOpen && "active")}
        onClick={() => dispatch(setSidebarOpen(false))}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-[#FDFBF7] border-r border-[#EADBCE] flex flex-col sidebar-transition",
          // Mobile: slide in/out as overlay
          "lg:static",
          isMobile
            ? cn(
                "w-72 pt-0 shadow-2xl",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              )
            : cn(
                // Desktop: expanded or collapsed icon rail
                "pt-0 translate-x-0",
                isSidebarOpen ? "w-64" : "w-[72px]"
              )
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "h-16 border-b border-[#EADBCE] flex items-center bg-[#FAF6F0] shrink-0",
            isCollapsed ? "px-0 justify-center" : "px-5 gap-3"
          )}
        >
          {/* Mobile close button */}
          {isMobile && isSidebarOpen && (
            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="p-2 rounded-xl text-[#766B62] hover:text-[#2F2924] hover:bg-[#EFE8DE] transition-colors mr-auto lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div
            className={cn(
              "w-9 h-9 rounded-lg bg-[#8B5E3C] flex items-center justify-center text-white shadow-sm shrink-0",
              isMobile && isSidebarOpen && "ml-0"
            )}
          >
            <Wheat className="w-4 h-4 text-[#E7B86A]" />
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden">
              <h2 className="font-heading font-bold text-base text-[#2F2924] whitespace-nowrap">
                Pantry & Math
              </h2>
              <p className="text-[10px] text-[#766B62] uppercase tracking-wider font-semibold whitespace-nowrap">
                Kitchen Costing
              </p>
            </div>
          )}
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-5 overflow-y-auto flex flex-col gap-1">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold text-[#8C8075] uppercase tracking-wider">
              Kitchen Workspace
            </div>
          )}

          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-150",
                  isCollapsed
                    ? "justify-center px-0 py-3 mx-auto w-12 h-12"
                    : "justify-between px-3.5 py-2.5",
                  isActive
                    ? "bg-[#8B5E3C] text-white shadow-sm font-semibold"
                    : "text-[#594E46] hover:bg-[#EFE8DE]/70 hover:text-[#2F2924]"
                )}
              >
                <div className={cn("flex items-center", isCollapsed ? "gap-0" : "gap-3")}>
                  <item.icon
                    className={cn(
                      "w-[18px] h-[18px] transition-colors shrink-0",
                      isActive
                        ? "text-[#E7B86A]"
                        : "text-[#766B62] group-hover:text-[#8B5E3C]"
                    )}
                  />
                  {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                </div>

                {/* Badge — only when expanded */}
                {!isCollapsed && item.badge && (
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

                {/* Collapsed tooltip */}
                {isCollapsed && (
                  <span className="sidebar-icon-tooltip">{item.name}</span>
                )}

                {/* Collapsed badge dot */}
                {isCollapsed && item.badge && item.badgeType === "warning" && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D97745] ring-2 ring-[#FDFBF7]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Kitchen Philosophy / Warm Pro Tip Card — only when expanded */}
        {!isCollapsed && (
          <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-[#FAF6F0] to-[#F5EFEB] border border-[#EADBCE]/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8B5E3C] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D97745]" />
              <span>Real-time Math</span>
            </div>
            <p className="text-[11px] text-[#766B62] leading-relaxed">
              Recipe costs and batch margins automatically adjust when ingredient purchase prices change.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
