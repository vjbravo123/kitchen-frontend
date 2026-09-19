"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { closeQuickBatchModal, addToast } from "@/lib/redux/slices/uiSlice";
import { prepareRecipe, fetchProductionList, fetchProductionSummary } from "@/lib/redux/slices/productionSlice";
import { fetchIngredients } from "@/lib/redux/slices/ingredientsSlice";
import { fetchLowStock, fetchValuation } from "@/lib/redux/slices/inventorySlice";
import { fetchRecipeCost, fetchRecipeAvailability } from "@/lib/redux/slices/recipesSlice";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { Flame, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export default function QuickBatchModal() {
  const dispatch = useAppDispatch();
  const { isQuickBatchModalOpen } = useAppSelector((state) => state.ui);
  const { items: recipes } = useAppSelector((state) => state.recipes);

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [servings, setServings] = useState<number>(1);
  const [sellingPrice, setSellingPrice] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availability, setAvailability] = useState<any>(null);
  const [costPreview, setCostPreview] = useState<any>(null);

  // Initialize selected recipe
  useEffect(() => {
    if (recipes.length > 0 && !selectedRecipeId) {
      setSelectedRecipeId(recipes[0]._id);
      setServings(recipes[0].baseServings || 1);
      if (recipes[0].sellingPrice) {
        setSellingPrice(recipes[0].sellingPrice.toString());
      }
    }
  }, [recipes, selectedRecipeId]);

  // When recipe or servings changes, fetch live availability & cost
  useEffect(() => {
    if (!selectedRecipeId || !isQuickBatchModalOpen) return;

    const currentRecipe = recipes.find((r) => r._id === selectedRecipeId);
    if (currentRecipe && !sellingPrice && currentRecipe.sellingPrice) {
      const scaledPrice = (currentRecipe.sellingPrice / currentRecipe.baseServings) * servings;
      setSellingPrice(Math.round(scaledPrice).toString());
    }

    dispatch(fetchRecipeAvailability({ id: selectedRecipeId, servings }))
      .unwrap()
      .then((avail) => setAvailability(avail))
      .catch(() => setAvailability(null));

    dispatch(fetchRecipeCost({ id: selectedRecipeId, servings }))
      .unwrap()
      .then((cost) => setCostPreview(cost))
      .catch(() => setCostPreview(null));
  }, [selectedRecipeId, servings, isQuickBatchModalOpen, dispatch, recipes]);

  const handleRecipeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rId = e.target.value;
    setSelectedRecipeId(rId);
    const r = recipes.find((item) => item._id === rId);
    if (r) {
      setServings(r.baseServings || 1);
      if (r.sellingPrice) {
        setSellingPrice(r.sellingPrice.toString());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipeId) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        servings: Number(servings),
      };
      if (sellingPrice && !isNaN(Number(sellingPrice))) {
        payload.sellingPrice = Number(sellingPrice);
      }
      if (notes) {
        payload.notes = notes;
      }

      await dispatch(
        prepareRecipe({
          recipeId: selectedRecipeId,
          data: payload,
        })
      ).unwrap();

      // Confetti celebration!
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#D97745", "#E7B86A", "#6F8F5F", "#8B5E3C"],
      });

      dispatch(
        addToast({
          type: "success",
          title: "Batch Prepared!",
          message: `Successfully cooked ${servings} serving(s) and updated pantry inventory.`,
        })
      );

      // Refresh inventory & production
      dispatch(fetchIngredients());
      dispatch(fetchLowStock());
      dispatch(fetchValuation());
      dispatch(fetchProductionList());
      dispatch(fetchProductionSummary());

      dispatch(closeQuickBatchModal());
    } catch (err: any) {
      dispatch(
        addToast({
          type: "error",
          title: "Production Failed",
          message: err || "Insufficient stock or error cooking batch.",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRecipe = recipes.find((r) => r._id === selectedRecipeId);

  return (
    <Modal
      isOpen={isQuickBatchModalOpen}
      onClose={() => dispatch(closeQuickBatchModal())}
      title="Cook / Prepare Kitchen Batch"
      description="Record a completed batch to automatically deduct ingredients from your pantry at current prices."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {recipes.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#FEF9F0] border border-[#E7B86A]/40 text-sm text-[#8C601E]">
            Please create at least one recipe first before cooking batches.
          </div>
        ) : (
          <>
            <Select
              label="Select Recipe"
              value={selectedRecipeId}
              onChange={handleRecipeChange}
              options={recipes.map((r) => ({
                label: `${r.name} (${r.baseServings} ${r.servingUnit})`,
                value: r._id,
              }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={`Servings (${currentRecipe?.servingUnit || "units"})`}
                type="number"
                min="0.1"
                step="any"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                required
              />

              <Input
                label="Total Sale / Selling Price (₹)"
                type="number"
                min="0"
                step="any"
                placeholder={costPreview?.sellingPrice ? costPreview.sellingPrice.toString() : "Optional"}
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                helper={costPreview?.totalCost ? `Cost: ${formatCurrency(costPreview.totalCost)}` : ""}
              />
            </div>

            {/* Live Stock Availability Alert */}
            {availability && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  availability.canProduce
                    ? "bg-[#F0F6EE] border-[#6F8F5F]/40 text-[#3C572F]"
                    : "bg-[#FEF4F2] border-[#D97745]/40 text-[#9C3825]"
                }`}
              >
                {availability.canProduce ? (
                  <CheckCircle2 className="w-4 h-4 text-[#6F8F5F] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#D97745] shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">
                    {availability.canProduce
                      ? `Ready to cook! (Max capacity with current pantry: ${availability.maxProducibleServings} ${currentRecipe?.servingUnit})`
                      : `Stock Shortage: Insufficient stock for ${availability.missingIngredients?.join(", ")}`}
                  </p>
                  {!availability.canProduce && (
                    <p className="mt-0.5 opacity-90">
                      You can adjust the quantity down or restock ingredients in the Pantry.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Live Cost & Margin Preview */}
            {costPreview && (
              <div className="p-3 bg-[#FDFBF7] border border-[#EADBCE] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#766B62]">Est. Total Cost: </span>
                  <span className="font-bold text-[#2F2924]">{formatCurrency(costPreview.totalCost)}</span>
                </div>
                <div>
                  <span className="text-[#766B62]">Est. Profit: </span>
                  <span className="font-bold text-[#6F8F5F]">{formatCurrency(costPreview.profit || 0)}</span>
                </div>
                <div>
                  <span className="text-[#766B62]">Margin: </span>
                  <span className="font-bold text-[#8B5E3C]">{costPreview.profitMarginPercent || 0}%</span>
                </div>
              </div>
            )}

            <Textarea
              label="Batch Notes / Order Ref"
              placeholder="e.g. Birthday Cake order #104 for Mrs. Sharma"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F2EAE0]">
              <Button
                type="button"
                variant="outline"
                onClick={() => dispatch(closeQuickBatchModal())}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={availability && !availability.canProduce}
                className="gap-1.5"
              >
                <Flame className="w-4 h-4" />
                <span>Cook & Deduct Stock</span>
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
