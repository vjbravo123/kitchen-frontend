"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchIngredients } from "@/lib/redux/slices/ingredientsSlice";
import { fetchLowStock, fetchValuation } from "@/lib/redux/slices/inventorySlice";
import { fetchRecipes } from "@/lib/redux/slices/recipesSlice";
import { fetchProductionList, fetchProductionSummary } from "@/lib/redux/slices/productionSlice";
import { openQuickBatchModal } from "@/lib/redux/slices/uiSlice";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import {
  ChefHat,
  Wheat,
  Boxes,
  BookOpen,
  Flame,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Clock,
  CircleDollarSign,
} from "lucide-react";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { vendor } = useAppSelector((state) => state.auth);
  const { items: ingredients } = useAppSelector((state) => state.ingredients);
  const { valuation, lowStockItems, isValuationLoading } = useAppSelector((state) => state.inventory);
  const { items: recipes, isLoading: isRecipesLoading } = useAppSelector((state) => state.recipes);
  const { records: productionRecords, summary: productionSummary } = useAppSelector((state) => state.production);

  useEffect(() => {
    dispatch(fetchIngredients());
    dispatch(fetchLowStock());
    dispatch(fetchValuation());
    dispatch(fetchRecipes({ withCost: true }));
    dispatch(fetchProductionList({ limit: 5 }));
    dispatch(fetchProductionSummary());
  }, [dispatch]);

  // Derived metrics
  const totalStockValue = valuation?.totalStockValue || 0;
  const totalRecipes = recipes.length;
  const avgMargin =
    recipes.length > 0
      ? Math.round(
          recipes.reduce((acc, r) => acc + (r.cost?.profitMarginPercent || 0), 0) / recipes.length
        )
      : 0;

  return (
    <AppShell>
      <div className="flex flex-col gap-8 pb-12">
        {/* Warm Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8B5E3C] via-[#7D5334] to-[#633F25] text-white p-6 sm:p-8 shadow-xl shadow-[#8B5E3C]/15 border border-[#8B5E3C]">
          {/* Subtle Decorative Background Motif */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
            <ChefHat className="w-64 h-64 text-white -rotate-12 translate-x-12" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-[#E7B86A] mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{vendor?.businessName || "Artisan Kitchen"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-heading tracking-tight text-white mb-2">
              Welcome to the Kitchen, Chef {vendor?.name || ""}
            </h1>

            <p className="text-sm sm:text-base text-[#FAF6F0]/85 leading-relaxed mb-6 font-light">
              Your pantry valuation is currently <span className="font-semibold text-[#E7B86A]">{formatCurrency(totalStockValue)}</span>.
              All recipe ingredient costs and batches are calculated live from current supplier rates.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                onClick={() => dispatch(openQuickBatchModal())}
                className="gap-2 shadow-lg shadow-[#D97745]/30 font-semibold"
              >
                <Flame className="w-4 h-4 fill-white/20" />
                <span>Cook New Batch</span>
              </Button>

              <Link href="/recipes/new">
                <Button
                  variant="outline"
                  className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Recipe</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 High-Impact KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Stock Valuation */}
          <Card className="p-5 border-[#EADBCE] bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#766B62] uppercase tracking-wider">
                Pantry Valuation
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#F5EFEB] text-[#8B5E3C] flex items-center justify-center">
                <CircleDollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#2F2924] font-heading tracking-tight">
                {formatCurrency(totalStockValue)}
              </div>
              <p className="text-xs text-[#766B62] mt-1 flex items-center gap-1.5">
                <span>{valuation?.ingredientCount || ingredients.length} pantry items recorded</span>
              </p>
            </div>
            <Link
              href="/inventory"
              className="mt-4 pt-3 border-t border-[#F2EAE0] flex items-center justify-between text-xs font-medium text-[#8B5E3C] hover:text-[#D97745]"
            >
              <span>View Stockroom</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Active Recipes & Margins */}
          <Card className="p-5 border-[#EADBCE] bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#766B62] uppercase tracking-wider">
                Menu & Recipes
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#F0F6EE] text-[#6F8F5F] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#2F2924] font-heading tracking-tight">
                {totalRecipes} Recipes
              </div>
              <p className="text-xs text-[#6F8F5F] font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{avgMargin}% average profit margin</span>
              </p>
            </div>
            <Link
              href="/recipes"
              className="mt-4 pt-3 border-t border-[#F2EAE0] flex items-center justify-between text-xs font-medium text-[#6F8F5F] hover:text-[#58744B]"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="p-5 border-[#EADBCE] bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#766B62] uppercase tracking-wider">
                Low Stock Alerts
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FEF9F0] text-[#E7B86A] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#D97745]" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#2F2924] font-heading tracking-tight flex items-center gap-2">
                <span>{lowStockItems.length}</span>
                {lowStockItems.length > 0 && (
                  <Badge variant="warning" size="sm">
                    Reorder Needed
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#766B62] mt-1">
                {lowStockItems.length === 0
                  ? "All ingredients well-stocked"
                  : `${lowStockItems.map((i) => i.name).slice(0, 2).join(", ")}${
                      lowStockItems.length > 2 ? ` +${lowStockItems.length - 2} more` : ""
                    }`}
              </p>
            </div>
            <Link
              href="/inventory"
              className="mt-4 pt-3 border-t border-[#F2EAE0] flex items-center justify-between text-xs font-medium text-[#D97745] hover:text-[#C56434]"
            >
              <span>Check Low Stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Kitchen Net Profit */}
          <Card className="p-5 border-[#EADBCE] bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#766B62] uppercase tracking-wider">
                Kitchen Net Profit
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FDF1EA] text-[#D97745] flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#2F2924] font-heading tracking-tight">
                {formatCurrency(productionSummary?.totals?.totalProfit || 0)}
              </div>
              <p className="text-xs text-[#766B62] mt-1 flex items-center gap-1">
                <span>{productionSummary?.totals?.batches || 0} batches cooked</span>
                <span className="text-[#6F8F5F] font-semibold">
                  ({productionSummary?.totals?.overallMarginPercent || 0}%)
                </span>
              </p>
            </div>
            <Link
              href="/production"
              className="mt-4 pt-3 border-t border-[#F2EAE0] flex items-center justify-between text-xs font-medium text-[#D97745] hover:text-[#C56434]"
            >
              <span>Production Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>

        {/* Two Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Recipes Catalog & Low Stock watchlist */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Top Recipes Spotlight */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Kitchen Menu & Real-Time Costing</CardTitle>
                  <CardDescription>Live cost breakdown computed at current pantry rates</CardDescription>
                </div>
                <Link href="/recipes">
                  <Button variant="outline" size="sm" className="text-xs">
                    View All ({recipes.length})
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {recipes.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#766B62]">
                    No recipes added yet. Click &quot;Create Recipe&quot; to begin.
                  </div>
                ) : (
                  <div className="divide-y divide-[#F2EAE0]">
                    {recipes.slice(0, 4).map((recipe) => {
                      const cost = recipe.cost;
                      const margin = cost?.profitMarginPercent || 0;
                      const canProduce = cost?.canProduce;

                      return (
                        <div
                          key={recipe._id}
                          className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FDFBF7] transition-colors"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FAF6F0] to-[#EADBCE] border border-[#EADBCE] flex items-center justify-center text-[#8B5E3C] shrink-0 shadow-inner">
                              <ChefHat className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                  href={`/recipes/${recipe._id}`}
                                  className="font-heading font-semibold text-base text-[#2F2924] hover:text-[#D97745] transition-colors"
                                >
                                  {recipe.name}
                                </Link>
                                {canProduce ? (
                                  <Badge variant="success" size="sm">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Ready ({cost?.maxProducibleServings} {recipe.servingUnit})</span>
                                  </Badge>
                                ) : (
                                  <Badge variant="warning" size="sm">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Missing Stock</span>
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-[#766B62] mt-0.5">
                                Base batch: {recipe.baseServings} {recipe.servingUnit} • {recipe.items?.length || 0} ingredients
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6">
                            <div className="text-right">
                              <div className="text-xs text-[#766B62]">Batch Cost</div>
                              <div className="font-semibold text-sm text-[#2F2924]">
                                {formatCurrency(cost?.totalCost || 0)}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xs text-[#766B62]">Selling Price</div>
                              <div className="font-semibold text-sm text-[#D97745]">
                                {recipe.sellingPrice ? formatCurrency(recipe.sellingPrice) : "—"}
                              </div>
                            </div>

                            <div className="text-right min-w-[70px]">
                              <div className="text-xs text-[#766B62]">Margin</div>
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                  margin >= 40
                                    ? "bg-[#F0F6EE] text-[#466537]"
                                    : margin > 0
                                    ? "bg-[#FEF9F0] text-[#9A6F20]"
                                    : "bg-[#FEF4F2] text-[#9C3825]"
                                }`}
                              >
                                {margin}%
                              </span>
                            </div>

                            <Link href={`/recipes/${recipe._id}`}>
                              <Button variant="outline" size="sm" className="h-8 px-3">
                                Scale & Cost
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Low Stock Watchlist */}
            {lowStockItems.length > 0 && (
              <Card className="border-[#E7B86A]/50 bg-[#FEFAF3]">
                <CardHeader className="border-b border-[#F5ECCF] bg-transparent">
                  <div className="flex items-center gap-2 text-[#A07324]">
                    <AlertTriangle className="w-5 h-5 text-[#D97745]" />
                    <CardTitle className="text-[#A07324]">Pantry Low-Stock Warning</CardTitle>
                  </div>
                  <CardDescription className="text-[#8C601E]">
                    The following ingredients have fallen to or below your kitchen&apos;s minimum threshold.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lowStockItems.map((item) => (
                      <div
                        key={item._id}
                        className="p-3.5 rounded-xl bg-white border border-[#F2E0BD] flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-sm text-[#2F2924]">{item.name}</p>
                          <p className="text-xs text-[#766B62]">
                            Current: <span className="font-bold text-[#C04838]">{formatNumber(item.currentQuantityInUnit || 0)} {item.unit}</span> (Min: {item.minimumStockLevel} {item.unit})
                          </p>
                        </div>
                        <Link href="/inventory">
                          <Button variant="honey" size="sm" className="h-7 text-xs px-2.5">
                            Restock
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Recent Production & Quick Actions */}
          <div className="flex flex-col gap-6">
            {/* Quick Actions Card */}
            <Card className="bg-gradient-to-b from-white to-[#FDFBF7]">
              <CardHeader>
                <CardTitle>Kitchen Quick Actions</CardTitle>
                <CardDescription>Common culinary operations</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5 pt-0">
                <Button
                  variant="primary"
                  onClick={() => dispatch(openQuickBatchModal())}
                  className="w-full justify-start gap-3 h-11"
                >
                  <Flame className="w-4 h-4 text-white" />
                  <span>Cook / Prepare Recipe Batch</span>
                </Button>

                <Link href="/inventory">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11 text-[#2F2924]">
                    <ShoppingBag className="w-4 h-4 text-[#8B5E3C]" />
                    <span>Record Ingredient Purchase</span>
                  </Button>
                </Link>

                <Link href="/recipes/new">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11 text-[#2F2924]">
                    <Plus className="w-4 h-4 text-[#D97745]" />
                    <span>Design New Recipe</span>
                  </Button>
                </Link>

                <Link href="/ingredients">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11 text-[#2F2924]">
                    <Wheat className="w-4 h-4 text-[#6F8F5F]" />
                    <span>Pantry Rate & Stock Manager</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Batches Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8B5E3C]" />
                  <CardTitle className="text-base">Recent Batches</CardTitle>
                </div>
                <Link href="/production" className="text-xs font-semibold text-[#D97745] hover:underline">
                  View Log
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {productionRecords.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#766B62]">
                    No batches cooked yet. Click &quot;Cook Batch&quot; above to log your first bake!
                  </div>
                ) : (
                  <div className="divide-y divide-[#F2EAE0]">
                    {productionRecords.slice(0, 5).map((record) => (
                      <div key={record._id} className="p-4 hover:bg-[#FDFBF7] transition-colors">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#2F2924]">{record.recipeName}</span>
                          <span className="text-[#8C8075]">{formatDate(record.preparedAt || record.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs text-[#766B62]">
                          <span>{record.servings} serving(s)</span>
                          <span className="font-medium text-[#6F8F5F]">+{formatCurrency(record.profit)} profit</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
