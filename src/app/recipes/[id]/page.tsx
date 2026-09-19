"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchRecipeById,
  fetchRecipeCost,
  scaleRecipe,
  fetchRecipeAvailability,
  suggestRecipePrice,
  deleteRecipe,
} from "@/lib/redux/slices/recipesSlice";
import { prepareRecipe, fetchProductionList, fetchProductionSummary } from "@/lib/redux/slices/productionSlice";
import { fetchIngredients } from "@/lib/redux/slices/ingredientsSlice";
import { fetchLowStock, fetchValuation } from "@/lib/redux/slices/inventorySlice";
import { addToast } from "@/lib/redux/slices/uiSlice";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  ChefHat,
  Scale,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
  Sparkles,
  Trash2,
  PieChart,
  ShoppingBag,
} from "lucide-react";

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const recipeId = resolvedParams.id;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { selectedRecipe, activeCostBreakdown, availability, suggestedPrice, isCostLoading } =
    useAppSelector((state) => state.recipes);

  // Scaler State
  const [scaleServings, setScaleServings] = useState<number>(1);
  const [targetMargin, setTargetMargin] = useState<number>(45);

  // Cook Batch Modal State
  const [isCookModalOpen, setIsCookModalOpen] = useState(false);
  const [cookSellingPrice, setCookSellingPrice] = useState<string>("");
  const [cookNotes, setCookNotes] = useState<string>("");
  const [isCooking, setIsCooking] = useState(false);

  useEffect(() => {
    dispatch(fetchRecipeById(recipeId));
    dispatch(fetchRecipeCost({ id: recipeId, servings: scaleServings }));
    dispatch(fetchRecipeAvailability({ id: recipeId, servings: scaleServings }));
    dispatch(suggestRecipePrice({ id: recipeId, targetMarginPercent: targetMargin, servings: scaleServings }));
  }, [dispatch, recipeId]);

  // When recipe loads, update default servings
  useEffect(() => {
    if (selectedRecipe && scaleServings === 1 && selectedRecipe.baseServings) {
      setScaleServings(selectedRecipe.baseServings);
    }
  }, [selectedRecipe]);

  // Handle Scale change
  const handleScale = (newServings: number) => {
    if (newServings <= 0) return;
    setScaleServings(newServings);
    dispatch(scaleRecipe({ id: recipeId, servings: newServings }));
    dispatch(fetchRecipeAvailability({ id: recipeId, servings: newServings }));
    dispatch(suggestRecipePrice({ id: recipeId, targetMarginPercent: targetMargin, servings: newServings }));
  };

  // Handle Target Margin change
  const handleMarginChange = (margin: number) => {
    setTargetMargin(margin);
    dispatch(suggestRecipePrice({ id: recipeId, targetMarginPercent: margin, servings: scaleServings }));
  };

  // Handle Cook Batch Execution
  const handleCookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCooking(true);
    try {
      await dispatch(
        prepareRecipe({
          recipeId,
          data: {
            servings: Number(scaleServings),
            sellingPrice: cookSellingPrice ? Number(cookSellingPrice) : undefined,
            notes: cookNotes || undefined,
          },
        })
      ).unwrap();

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#D97745", "#E7B86A", "#6F8F5F", "#8B5E3C"],
      });

      dispatch(
        addToast({
          type: "success",
          title: "Batch Baked & Deducted!",
          message: `Successfully cooked ${scaleServings} ${selectedRecipe?.servingUnit} of ${selectedRecipe?.name}. Pantry inventory updated.`,
        })
      );

      setIsCookModalOpen(false);
      setCookNotes("");
      // Refresh
      dispatch(fetchIngredients());
      dispatch(fetchLowStock());
      dispatch(fetchValuation());
      dispatch(fetchRecipeAvailability({ id: recipeId, servings: scaleServings }));
      dispatch(fetchProductionList());
      dispatch(fetchProductionSummary());
    } catch (err: any) {
      dispatch(addToast({ type: "error", title: "Batch Failed", message: err }));
    } finally {
      setIsCooking(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Archive recipe "${selectedRecipe?.name}"?`)) {
      try {
        await dispatch(deleteRecipe(recipeId)).unwrap();
        dispatch(
          addToast({
            type: "success",
            title: "Recipe Archived",
            message: "Recipe removed from catalog.",
          })
        );
        router.push("/recipes");
      } catch (err: any) {
        dispatch(addToast({ type: "error", title: "Cannot Archive", message: err }));
      }
    }
  };

  if (!selectedRecipe) {
    return (
      <AppShell>
        <div className="p-12 text-center text-sm text-[#766B62]">Loading recipe workbench...</div>
      </AppShell>
    );
  }

  const cost = activeCostBreakdown;
  const canProduce = availability?.canProduce ?? cost?.canProduce ?? true;

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-16 max-w-6xl mx-auto">
        {/* Top Bar Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/recipes"
              className="p-2 rounded-xl text-[#766B62] hover:bg-[#EFE8DE] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#2F2924] tracking-tight">
                  {selectedRecipe.name}
                </h1>
                {canProduce ? (
                  <Badge variant="success" size="md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Stock (Max {availability?.maxProducibleServings || cost?.maxProducibleServings} {selectedRecipe.servingUnit})</span>
                  </Badge>
                ) : (
                  <Badge variant="warning" size="md">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Pantry Shortage</span>
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#766B62] mt-0.5">
                Base batch: {selectedRecipe.baseServings} {selectedRecipe.servingUnit} • {selectedRecipe.description || "Artisanal Kitchen Recipe"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              title="Archive Recipe"
              className="p-2.5 rounded-xl text-[#8C8075] hover:text-[#C04838] hover:bg-[#FEF4F2] transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <Button
              variant="primary"
              onClick={() => {
                setCookSellingPrice(cost?.sellingPrice ? cost.sellingPrice.toString() : "");
                setIsCookModalOpen(true);
              }}
              className="gap-2 shadow-md"
            >
              <Flame className="w-4 h-4" />
              <span>Cook This Batch</span>
            </Button>
          </div>
        </div>

        {/* Interactive Batch Scaler Card */}
        <Card className="p-6 bg-gradient-to-br from-white to-[#FDFBF7] border-[#EADBCE]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-[#8B5E3C]">
                <Scale className="w-5 h-5 text-[#D97745]" />
                <h3 className="font-heading font-semibold text-lg text-[#2F2924]">
                  Interactive Kitchen Batch Scaler
                </h3>
              </div>
              <p className="text-xs text-[#766B62] mt-0.5">
                Scale batch size up or down. All ingredient quantities and costs multiply automatically.
              </p>
            </div>

            {/* Quick Scale Presets */}
            <div className="flex items-center gap-1.5 bg-[#FAF6F0] p-1 rounded-xl border border-[#EADBCE]">
              {[1, 2, 5, 10, 20].map((multiplier) => {
                const target = (selectedRecipe.baseServings || 1) * multiplier;
                const isSelected = scaleServings === target;
                return (
                  <button
                    key={multiplier}
                    type="button"
                    onClick={() => handleScale(target)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#8B5E3C] text-white shadow-sm"
                        : "text-[#766B62] hover:text-[#2F2924]"
                    }`}
                  >
                    {multiplier}x
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center pt-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#594E46] mb-1 block">
                Target Servings / Yield ({selectedRecipe.servingUnit}):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="100"
                  step="0.5"
                  value={scaleServings}
                  onChange={(e) => handleScale(Number(e.target.value))}
                  className="w-full accent-[#D97745] cursor-pointer"
                />
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={scaleServings}
                  onChange={(e) => handleScale(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 rounded-xl border border-[#EADBCE] text-sm text-center font-bold text-[#2F2924] bg-white"
                />
              </div>
            </div>

            <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#F2EAE0] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#766B62] block">Current Scale Factor</span>
                <span className="font-bold text-sm text-[#8B5E3C]">
                  {cost?.scaleFactor ? `${cost.scaleFactor}x` : "1x"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#766B62] block">Scaled Batch Cost</span>
                <span className="font-bold text-sm text-[#2F2924]">
                  {formatCurrency(cost?.totalCost || 0)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Shortage Warning Banner if Missing Stock */}
        {!canProduce && availability?.missingIngredients && (
          <div className="p-4 rounded-2xl bg-[#FEFAF3] border border-[#E7B86A] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#D97745] shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-semibold text-[#A07324] text-sm">Pantry Stock Shortage</h4>
              <p className="text-[#766B62] mt-0.5">
                You do not have enough stock in the pantry to cook {scaleServings} {selectedRecipe.servingUnit}.
                Shortage detected for: <span className="font-bold text-[#2F2924]">{availability.missingIngredients.join(", ")}</span>.
                Restock ingredients in the Pantry or scale down the batch.
              </p>
            </div>
          </div>
        )}

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Ingredients Table & Breakdown */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Scaled Ingredients Breakdown</CardTitle>
                  <CardDescription>
                    Quantities and costs calculated for {scaleServings} {selectedRecipe.servingUnit}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6F0] border-b border-[#F2EAE0] text-[#766B62] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Ingredient</th>
                      <th className="px-5 py-3.5 text-right">Required Qty</th>
                      <th className="px-5 py-3.5 text-right">In Pantry</th>
                      <th className="px-5 py-3.5 text-right">Base Rate</th>
                      <th className="px-5 py-3.5 text-right">Total Line Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EAE0]">
                    {cost?.lines?.map((line) => {
                      const hasShortage = !line.isSufficient;
                      return (
                        <tr
                          key={line.ingredientId}
                          className={`hover:bg-[#FDFBF7] transition-colors ${
                            hasShortage ? "bg-[#FEF9F0]/60" : ""
                          }`}
                        >
                          <td className="px-5 py-3 font-semibold text-[#2F2924] whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {line.name}
                              {hasShortage && (
                                <span className="text-[10px] text-[#D97745] font-bold px-1.5 py-0.5 rounded bg-[#FEF4F2] border border-[#D97745]/30">
                                  Shortage
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-[#2F2924] whitespace-nowrap">
                            {formatNumber(line.requiredQuantity)} {line.baseUnit}
                          </td>
                          <td className="px-5 py-3 text-right text-[#766B62] whitespace-nowrap">
                            <span className={hasShortage ? "text-[#C04838] font-bold" : ""}>
                              {formatNumber(line.availableQuantity)} {line.baseUnit}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right text-[#766B62] whitespace-nowrap">
                            {formatCurrency(line.costPerBaseUnit)}/{line.baseUnit}
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-[#8B5E3C] whitespace-nowrap">
                            {formatCurrency(line.lineCost)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Overheads & Wastage Card */}
            <Card className="p-5 bg-white">
              <h3 className="font-heading font-semibold text-base text-[#2F2924] mb-3">
                Overheads & Wastage Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#F2EAE0]">
                  <span className="text-[#766B62] block text-[11px]">Ingredients</span>
                  <span className="font-bold text-[#2F2924] text-sm">
                    {formatCurrency(cost?.ingredientCost || 0)}
                  </span>
                </div>

                <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#F2EAE0]">
                  <span className="text-[#766B62] block text-[11px]">Packaging</span>
                  <span className="font-bold text-[#2F2924] text-sm">
                    {formatCurrency(cost?.packagingCost || 0)}
                  </span>
                </div>

                <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#F2EAE0]">
                  <span className="text-[#766B62] block text-[11px]">Labor & Prep</span>
                  <span className="font-bold text-[#2F2924] text-sm">
                    {formatCurrency(cost?.laborCost || 0)}
                  </span>
                </div>

                <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#F2EAE0]">
                  <span className="text-[#766B62] block text-[11px]">
                    Wastage ({cost?.wastage?.value || 0}%)
                  </span>
                  <span className="font-bold text-[#2F2924] text-sm">
                    {formatCurrency(cost?.wastageCost || 0)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Smart Margin Calculator & Financials */}
          <div className="flex flex-col gap-6">
            {/* Financial Summary Card */}
            <Card className="bg-gradient-to-b from-white to-[#FAF6F0] border-[#EADBCE]">
              <CardHeader className="border-b border-[#F2EAE0]">
                <CardTitle>Batch Financial Summary</CardTitle>
                <CardDescription>
                  For {scaleServings} {selectedRecipe.servingUnit}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#766B62]">
                    <span>Total Cost to Cook:</span>
                    <span className="font-bold text-sm text-[#2F2924]">
                      {formatCurrency(cost?.totalCost || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#766B62]">
                    <span>Cost Per {selectedRecipe.servingUnit}:</span>
                    <span className="font-semibold text-[#8B5E3C]">
                      {formatCurrency(cost?.costPerServing || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#766B62]">
                    <span>Break-even Price:</span>
                    <span className="font-semibold text-[#766B62]">
                      {formatCurrency(cost?.breakEvenPrice || 0)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#EADBCE] flex justify-between text-[#766B62]">
                    <span>Selling Price:</span>
                    <span className="font-bold text-sm text-[#D97745]">
                      {cost?.sellingPrice ? formatCurrency(cost.sellingPrice) : "Not set"}
                    </span>
                  </div>

                  <div className="flex justify-between font-bold text-sm text-[#6F8F5F]">
                    <span>Net Profit:</span>
                    <span>{formatCurrency(cost?.profit || 0)}</span>
                  </div>

                  <div className="flex justify-between font-bold text-sm text-[#8B5E3C]">
                    <span>Profit Margin:</span>
                    <span>{cost?.profitMarginPercent || 0}%</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={() => {
                    setCookSellingPrice(cost?.sellingPrice ? cost.sellingPrice.toString() : "");
                    setIsCookModalOpen(true);
                  }}
                  className="w-full gap-2 mt-2 shadow-md"
                >
                  <Flame className="w-4 h-4" />
                  <span>Cook {scaleServings} {selectedRecipe.servingUnit}</span>
                </Button>
              </CardContent>
            </Card>

            {/* Smart Margin Price Suggester Tool */}
            <Card className="bg-white border-[#EADBCE]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-[#D97745]">
                  <TrendingUp className="w-4 h-4" />
                  <CardTitle className="text-base">Smart Margin Price Suggester</CardTitle>
                </div>
                <CardDescription>
                  Calculate ideal menu pricing based on target profitability.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-[#594E46]">Target Profit Margin:</span>
                    <span className="font-bold text-[#D97745] text-sm">{targetMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="80"
                    step="1"
                    value={targetMargin}
                    onChange={(e) => handleMarginChange(Number(e.target.value))}
                    className="w-full accent-[#D97745] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#8C8075] mt-1">
                    <span>15% (Budget)</span>
                    <span>45% (Standard)</span>
                    <span>70%+ (Gourmet)</span>
                  </div>
                </div>

                {suggestedPrice && (
                  <div className="p-3.5 bg-[#FEF9F0] border border-[#E7B86A]/40 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#766B62]">Recommended Total Price:</span>
                      <span className="font-bold text-[#D97745] text-sm">
                        {formatCurrency(suggestedPrice.suggestedSellingPrice)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#766B62]">Price Per {selectedRecipe.servingUnit}:</span>
                      <span className="font-semibold text-[#2F2924]">
                        {formatCurrency(suggestedPrice.suggestedSellingPrice / scaleServings)}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-[#6F8F5F] font-medium pt-1 border-t border-[#E7B86A]/30">
                      <span>Est. Margin Earned:</span>
                      <span>+{formatCurrency(suggestedPrice.suggestedSellingPrice - suggestedPrice.totalCost)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal: Cook This Scaled Batch */}
        <Modal
          isOpen={isCookModalOpen}
          onClose={() => setIsCookModalOpen(false)}
          title={`Cook Batch: ${selectedRecipe.name}`}
          description={`Prepare ${scaleServings} ${selectedRecipe.servingUnit}. Ingredients will be atomically deducted from your pantry.`}
          maxWidth="md"
        >
          <form onSubmit={handleCookSubmit} className="flex flex-col gap-4">
            <div className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#F2EAE0] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#766B62]">Batch Yield:</span>
                <span className="font-bold text-[#2F2924]">
                  {scaleServings} {selectedRecipe.servingUnit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#766B62]">Total Ingredient & Overhead Cost:</span>
                <span className="font-bold text-[#8B5E3C]">
                  {formatCurrency(cost?.totalCost || 0)}
                </span>
              </div>
            </div>

            <Input
              label="Actual Selling Price (₹)"
              type="number"
              min="0"
              step="any"
              placeholder={cost?.sellingPrice ? cost.sellingPrice.toString() : "Optional"}
              value={cookSellingPrice}
              onChange={(e) => setCookSellingPrice(e.target.value)}
              helper="Leave blank to use default scaled price"
            />

            <Textarea
              label="Production Order / Kitchen Notes"
              placeholder="e.g. Wedding banquet order #203, delivered fresh at 4pm"
              value={cookNotes}
              onChange={(e) => setCookNotes(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2EAE0]">
              <Button type="button" variant="outline" onClick={() => setIsCookModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isCooking} className="gap-1.5">
                <Flame className="w-4 h-4" />
                <span>Confirm & Deduct Stock</span>
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
