"use client";

import React from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/slices/authSlice";
import { openQuickBatchModal, toggleSidebar } from "@/lib/redux/slices/uiSlice";
import { Button } from "@/components/ui/Button";
import {
  Menu,
  PanelLeftClose,
  ChefHat,
  Flame,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { vendor } = useAppSelector((state) => state.auth);
  const { lowStockItems } = useAppSelector((state) => state.inventory);
  const { isSidebarOpen } = useAppSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-[#EADBCE] px-3 sm:px-4 lg:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sidebar toggle — visible on ALL screen sizes */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-xl text-[#6E492E] hover:bg-[#EFE8DE] transition-colors"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#D97745] to-[#8B5E3C] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="hidden xs:block">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-base sm:text-lg text-[#2F2924] tracking-tight">
                {vendor?.businessName || "Kitchen Math"}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FEF9F0] text-[#A07324] border border-[#E7B86A]/40 hidden sm:inline-block">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#766B62] -mt-0.5 hidden md:block">
              Artisan Food Costing & Stock Control
            </p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Cook Batch Button */}
        <Button
          onClick={() => dispatch(openQuickBatchModal())}
          variant="primary"
          size="sm"
          className="hidden sm:inline-flex items-center gap-1.5 shadow-sm"
        >
          <Flame className="w-4 h-4 text-white fill-white/20" />
          <span className="hidden md:inline">Cook Batch</span>
        </Button>

        {/* Mobile Cook button (icon only) */}
        <Button
          onClick={() => dispatch(openQuickBatchModal())}
          variant="primary"
          size="icon"
          className="sm:hidden"
          aria-label="Cook Batch"
        >
          <Flame className="w-4 h-4" />
        </Button>

        {/* Low Stock Indicator */}
        {lowStockItems.length > 0 && (
          <Link
            href="/inventory"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF9F0] border border-[#E7B86A]/50 text-xs font-semibold text-[#A07324] hover:bg-[#FDF3E3] transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{lowStockItems.length} Low Stock</span>
          </Link>
        )}

        {/* Chef Avatar / User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-[#EADBCE]">
          <Link
            href="/settings"
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#EFE8DE] transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center font-medium text-xs shadow-inner">
              {vendor?.name?.charAt(0) || "C"}
            </div>
            <div className="hidden lg:block text-xs">
              <p className="font-semibold text-[#2F2924] leading-tight">
                {vendor?.name || "Chef"}
              </p>
              <p className="text-[#8C8075] text-[11px]">
                {vendor?.email || "Signed in"}
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-xl text-[#766B62] hover:text-[#C04838] hover:bg-[#FDF1EA] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
