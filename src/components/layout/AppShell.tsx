"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchIngredients } from "@/lib/redux/slices/ingredientsSlice";
import { fetchLowStock, fetchValuation } from "@/lib/redux/slices/inventorySlice";
import { fetchRecipes } from "@/lib/redux/slices/recipesSlice";
import { fetchProductionSummary } from "@/lib/redux/slices/productionSlice";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import QuickBatchModal from "@/components/production/QuickBatchModal";
import { Loader2 } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, token } = useAppSelector((state) => state.auth);
  const { isSidebarOpen } = useAppSelector((state) => state.ui);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  useEffect(() => {
    const storedToken = localStorage.getItem("kitchen_token");
    if (!storedToken && !isAuthPage) {
      router.push("/login");
    } else if (storedToken && isAuthPage) {
      router.push("/");
    }
    setIsCheckingAuth(false);
  }, [isAuthenticated, isAuthPage, router]);

  // Load essential kitchen state once authenticated
  useEffect(() => {
    if (token || isAuthenticated) {
      dispatch(fetchIngredients());
      dispatch(fetchLowStock());
      dispatch(fetchValuation());
      dispatch(fetchRecipes({ withCost: true }));
      dispatch(fetchProductionSummary());
    }
  }, [dispatch, token, isAuthenticated]);

  if (isAuthPage) {
    return <main className="min-h-screen bg-[#FAF6F0]">{children}</main>;
  }

  if (isCheckingAuth || (!isAuthenticated && !token && isLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6F0] text-[#8B5E3C]">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#D97745]" />
        <p className="font-heading text-base font-medium">Entering Artisan Kitchen...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 w-full">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <QuickBatchModal />
    </div>
  );
}
