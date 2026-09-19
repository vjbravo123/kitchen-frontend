"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchRecipes, deleteRecipe } from "@/lib/redux/slices/recipesSlice";
import { openQuickBatchModal, addToast } from "@/lib/redux/slices/uiSlice";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChefHat,
  Scale,
  Trash2,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function RecipesPage() {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((state) => state.recipes);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchRecipes({ search, withCost: true }));
  }, [dispatch, search]);

  const handleDelete = async (recipeId: string, name: string) => {
    if (confirm(`Archive recipe "${name}"?`)) {
      try {
        await dispatch(deleteRecipe(recipeId)).unwrap();
        dispatch(
          addToast({
            type: "success",
            title: "Recipe Archived",
            message: `${name} has been archived.`,
          })
        );
      } catch (err: any) {
        dispatch(addToast({ type: "error", title: "Archive Failed", message: err }));
      }
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#2F2924] tracking-tight">
                Recipe Catalog & Costing
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F5EFEB] text-[#8B5E3C] border border-[#8B5E3C]/20">
                {items.length} recipes
              </span>
            </div>
            <p className="text-sm text-[#766B62] mt-1">
              Live batch costing, real-time pantry stock check, overheads, margins and interactive scaling.
            </p>
          </div>

          <Link href="/recipes/new">
            <Button variant="primary" className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Create New Recipe</span>
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white border border-[#EADBCE] rounded-2xl shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#9C8F84]" />
            <input
              type="text"
              placeholder="Search recipes by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EADBCE] text-sm text-[#2F2924] bg-[#FAF6F0]/40 focus:bg-white focus:border-[#D97745] focus:outline-none focus:ring-2 focus:ring-[#D97745]/20"
            />
          </div>
        </div>

        {/* Recipes Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[#766B62]">Loading recipe catalog...</div>
        ) : items.length === 0 ? (
          <div className="p-12 bg-white border border-[#EADBCE] rounded-2xl text-center">
            <BookOpen className="w-12 h-12 text-[#D9C4B0] mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-lg text-[#2F2924]">No Recipes Found</h3>
            <p className="text-xs text-[#766B62] mt-1 mb-4">
              {search ? "No recipes match your search query." : "You haven't added any recipes to your menu yet."}
            </p>
            <Link href="/recipes/new">
              <Button variant="primary" size="sm">
                Create First Recipe
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((recipe) => {
              const cost = recipe.cost;
              const margin = cost?.profitMarginPercent || 0;
              const canProduce = cost?.canProduce;

              return (
                <Card key={recipe._id} className="flex flex-col justify-between hover:border-[#D97745]/40 transition-all">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <Link
                          href={`/recipes/${recipe._id}`}
                          className="font-heading font-semibold text-xl text-[#2F2924] hover:text-[#D97745] transition-colors leading-tight block"
                        >
                          {recipe.name}
                        </Link>
                        {recipe.description && (
                          <p className="text-xs text-[#766B62] mt-1 line-clamp-2">
                            {recipe.description}
                          </p>
                        )}
                      </div>

                      {canProduce ? (
                        <Badge variant="success" size="sm" className="shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Ready ({cost?.maxProducibleServings} {recipe.servingUnit})</span>
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" className="shrink-0">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Missing Stock</span>
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-[#8C8075] mb-4">
                      Base Batch: <span className="font-semibold text-[#2F2924]">{recipe.baseServings} {recipe.servingUnit}</span> • {recipe.items?.length || 0} ingredients
                    </div>

                    {/* Cost & Profit Box */}
                    <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#F2EAE0] flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#766B62]">Live Batch Cost:</span>
                        <span className="font-bold text-[#2F2924] text-sm">
                          {formatCurrency(cost?.totalCost || 0)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#766B62]">Selling Price:</span>
                        <span className="font-bold text-[#D97745] text-sm">
                          {recipe.sellingPrice ? formatCurrency(recipe.sellingPrice) : "Not set"}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-[#EADBCE]/80 flex items-center justify-between text-xs">
                        <span className="text-[#766B62]">Profit Margin:</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-md ${
                              margin >= 40
                                ? "bg-[#F0F6EE] text-[#466537]"
                                : margin > 0
                                ? "bg-[#FEF9F0] text-[#9A6F20]"
                                : "bg-[#FEF4F2] text-[#9C3825]"
                            }`}
                          >
                            {margin}%
                          </span>
                          {cost?.profit ? (
                            <span className="text-[#6F8F5F] font-semibold text-[11px]">
                              (+{formatCurrency(cost.profit)})
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="px-6 py-3.5 bg-[#FDFBF7] border-t border-[#F2EAE0] rounded-b-2xl flex items-center justify-between">
                    <button
                      onClick={() => handleDelete(recipe._id, recipe.name)}
                      title="Archive recipe"
                      className="p-1.5 rounded-lg text-[#9C8F84] hover:text-[#C04838] hover:bg-[#FEF4F2] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <Link href={`/recipes/${recipe._id}`}>
                        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                          <Scale className="w-3.5 h-3.5 text-[#8B5E3C]" />
                          <span>Scale & Cost</span>
                        </Button>
                      </Link>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => dispatch(openQuickBatchModal())}
                        className="h-8 gap-1 text-xs"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Cook</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
