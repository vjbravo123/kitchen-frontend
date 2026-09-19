"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { createRecipe } from "@/lib/redux/slices/recipesSlice";
import { fetchIngredients } from "@/lib/redux/slices/ingredientsSlice";
import { addToast } from "@/lib/redux/slices/uiSlice";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { formatCurrency, UNIT_OPTIONS } from "@/lib/utils";
import { WastageBasis, WastageType } from "@/types";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChefHat,
  Sparkles,
  Calculator,
  Save,
  Wheat,
} from "lucide-react";

interface RecipeRow {
  ingredientId: string;
  quantity: string;
  unit: string;
  note?: string;
}

export default function NewRecipePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: ingredients } = useAppSelector((state) => state.ingredients);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseServings, setBaseServings] = useState("1");
  const [servingUnit, setServingUnit] = useState("serving");

  // Items State
  const [items, setItems] = useState<RecipeRow[]>([
    { ingredientId: "", quantity: "100", unit: "g" },
  ]);

  // Overheads
  const [packagingCost, setPackagingCost] = useState("0");
  const [laborCost, setLaborCost] = useState("0");
  const [utilityCost, setUtilityCost] = useState("0");
  const [scaleOverheads, setScaleOverheads] = useState(true);

  // Wastage
  const [wastageType, setWastageType] = useState<WastageType>("PERCENTAGE");
  const [wastageValue, setWastageValue] = useState("3");
  const [wastageBasis, setWastageBasis] = useState<WastageBasis>("INGREDIENT");

  // Pricing
  const [sellingPrice, setSellingPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchIngredients());
  }, [dispatch]);

  // Pre-fill first ingredient if available
  useEffect(() => {
    if (ingredients.length > 0 && !items[0].ingredientId) {
      setItems([{ ingredientId: ingredients[0]._id, quantity: "100", unit: ingredients[0].unit }]);
    }
  }, [ingredients, items]);

  const handleAddItem = () => {
    if (ingredients.length === 0) return;
    setItems([
      ...items,
      { ingredientId: ingredients[0]._id, quantity: "100", unit: ingredients[0].unit },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      dispatch(addToast({ type: "warning", message: "A recipe must have at least one ingredient." }));
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof RecipeRow, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // If ingredient changed, update default unit to match
    if (field === "ingredientId") {
      const ing = ingredients.find((i) => i._id === value);
      if (ing) {
        updated[index].unit = ing.unit;
      }
    }

    setItems(updated);
  };

  // Calculate live estimates on client
  const estimatedIngredientCost = items.reduce((acc, row) => {
    const ing = ingredients.find((i) => i._id === row.ingredientId);
    if (!ing) return acc;
    const qty = Number(row.quantity) || 0;
    // rough estimate using base unit conversion
    let baseQty = qty;
    if (row.unit === "kg" || row.unit === "ltr") baseQty = qty * 1000;
    if (row.unit === "dozen") baseQty = qty * 12;
    return acc + baseQty * (ing.costPerBaseUnit || 0);
  }, 0);

  const overheadsTotal =
    (Number(packagingCost) || 0) + (Number(laborCost) || 0) + (Number(utilityCost) || 0);

  let wastageEst = 0;
  if (wastageType === "PERCENTAGE") {
    const basisCost = wastageBasis === "INGREDIENT" ? estimatedIngredientCost : estimatedIngredientCost + overheadsTotal;
    wastageEst = (basisCost * (Number(wastageValue) || 0)) / 100;
  } else if (wastageType === "FIXED") {
    wastageEst = Number(wastageValue) || 0;
  }

  const totalEstCost = estimatedIngredientCost + overheadsTotal + wastageEst;
  const numServings = Number(baseServings) || 1;
  const costPerServ = totalEstCost / numServings;
  const sellPriceNum = Number(sellingPrice) || 0;
  const estProfit = sellPriceNum - totalEstCost;
  const estMargin = sellPriceNum > 0 ? Math.round((estProfit / sellPriceNum) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        description: description.trim() || undefined,
        baseServings: Number(baseServings),
        servingUnit: servingUnit.trim() || "serving",
        items: items.map((it) => ({
          ingredientId: it.ingredientId,
          quantity: Number(it.quantity),
          unit: it.unit,
          note: it.note?.trim() || undefined,
        })),
        packagingCost: packagingCost ? Number(packagingCost) : 0,
        laborCost: laborCost ? Number(laborCost) : 0,
        utilityCost: utilityCost ? Number(utilityCost) : 0,
        wastageType,
        wastageValue: Number(wastageValue) || 0,
        wastageBasis,
        sellingPrice: sellingPrice ? Number(sellingPrice) : undefined,
        scaleOverheads,
      };

      const created = await dispatch(createRecipe(payload)).unwrap();

      dispatch(
        addToast({
          type: "success",
          title: "Recipe Created!",
          message: `Created "${created.name}" with dynamic costing calculations.`,
        })
      );

      router.push(`/recipes/${created._id}`);
    } catch (err: any) {
      dispatch(addToast({ type: "error", title: "Failed to Create Recipe", message: err }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-16 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/recipes" className="p-2 rounded-xl text-[#766B62] hover:bg-[#EFE8DE] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#2F2924] tracking-tight">
                Design New Recipe
              </h1>
              <p className="text-xs sm:text-sm text-[#766B62]">
                Ingredients, overheads, wastage allowances and live profit margins.
              </p>
            </div>
          </div>

          <Button type="submit" variant="primary" isLoading={isSubmitting} className="gap-2 shadow-md">
            <Save className="w-4 h-4" />
            <span>Save & Open Costing</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Recipe Form - 2 Columns */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* 1. Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>1. Recipe Basics</CardTitle>
                <CardDescription>Batch size and general serving definitions</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Input
                  label="Recipe Name"
                  placeholder="e.g. Sourdough Country Loaf, Chocolate Truffle Cake"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Batch Size (Servings/Yield)"
                    type="number"
                    min="0.01"
                    step="any"
                    value={baseServings}
                    onChange={(e) => setBaseServings(e.target.value)}
                    required
                  />

                  <Input
                    label="Serving Unit"
                    placeholder="e.g. kg, loaf, cake, slice, piece"
                    value={servingUnit}
                    onChange={(e) => setServingUnit(e.target.value)}
                    required
                  />
                </div>

                <Textarea
                  label="Description / Method Notes"
                  placeholder="Baking temperature, proofing hours, or flavor profile notes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* 2. Ingredients Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>2. Recipe Ingredients</CardTitle>
                  <CardDescription>Pantry ingredients for ONE base batch</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="text-xs gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {ingredients.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#766B62]">
                    No ingredients found in your pantry. Please add ingredients first in the Pantry tab.
                  </div>
                ) : (
                  <div className="divide-y divide-[#F2EAE0]">
                    {items.map((row, index) => {
                      const selectedIng = ingredients.find((i) => i._id === row.ingredientId);
                      return (
                        <div key={index} className="p-4 flex items-center gap-3 bg-white hover:bg-[#FDFBF7] transition-colors">
                          <div className="flex-1 min-w-[140px]">
                            <select
                              value={row.ingredientId}
                              onChange={(e) => handleItemChange(index, "ingredientId", e.target.value)}
                              className="w-full text-xs rounded-xl border border-[#EADBCE] bg-white p-2 text-[#2F2924] focus:border-[#D97745]"
                              required
                            >
                              {ingredients.map((ing) => (
                                <option key={ing._id} value={ing._id}>
                                  {ing.name} ({formatCurrency(ing.costPerBaseUnit)}/{ing.baseUnit})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="w-24">
                            <input
                              type="number"
                              min="0.0001"
                              step="any"
                              placeholder="Qty"
                              value={row.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                              className="w-full text-xs rounded-xl border border-[#EADBCE] bg-white p-2 text-[#2F2924] focus:border-[#D97745]"
                              required
                            />
                          </div>

                          <div className="w-24">
                            <select
                              value={row.unit}
                              onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                              className="w-full text-xs rounded-xl border border-[#EADBCE] bg-white p-2 text-[#2F2924] focus:border-[#D97745]"
                            >
                              {UNIT_OPTIONS.map((u) => (
                                <option key={u.value} value={u.value}>
                                  {u.value}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1.5 rounded-lg text-[#9C8F84] hover:text-[#C04838] hover:bg-[#FEF4F2] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. Overheads & Wastage */}
            <Card>
              <CardHeader>
                <CardTitle>3. Overheads & Wastage Configuration</CardTitle>
                <CardDescription>Packaging, kitchen utilities, labor and shrinkage</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Packaging Cost (₹)"
                    type="number"
                    min="0"
                    step="any"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(e.target.value)}
                    helper="Boxes, ribbons, labels"
                  />

                  <Input
                    label="Labor Cost (₹)"
                    type="number"
                    min="0"
                    step="any"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    helper="Chef/prep time"
                  />

                  <Input
                    label="Utility Cost (₹)"
                    type="number"
                    min="0"
                    step="any"
                    value={utilityCost}
                    onChange={(e) => setUtilityCost(e.target.value)}
                    helper="Gas, oven power"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-[#2F2924] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scaleOverheads}
                    onChange={(e) => setScaleOverheads(e.target.checked)}
                    className="rounded text-[#D97745] focus:ring-[#D97745]"
                  />
                  <span>Scale overheads proportionally when multiplying batch sizes</span>
                </label>

                <div className="pt-3 border-t border-[#F2EAE0] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select
                    label="Wastage Type"
                    value={wastageType}
                    onChange={(e) => setWastageType(e.target.value as WastageType)}
                    options={[
                      { label: "Percentage (%)", value: "PERCENTAGE" },
                      { label: "Fixed Amount (₹)", value: "FIXED" },
                      { label: "None (0)", value: "NONE" },
                    ]}
                  />

                  <Input
                    label={wastageType === "PERCENTAGE" ? "Wastage Rate (%)" : "Wastage Amount (₹)"}
                    type="number"
                    min="0"
                    step="any"
                    value={wastageValue}
                    onChange={(e) => setWastageValue(e.target.value)}
                    disabled={wastageType === "NONE"}
                  />

                  <Select
                    label="Wastage Calculated On"
                    value={wastageBasis}
                    onChange={(e) => setWastageBasis(e.target.value as WastageBasis)}
                    disabled={wastageType !== "PERCENTAGE"}
                    options={[
                      { label: "Ingredients Only", value: "INGREDIENT" },
                      { label: "Subtotal (Ing + Overheads)", value: "SUBTOTAL" },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Math & Pricing Preview */}
          <div className="flex flex-col gap-6">
            <Card className="sticky top-20 bg-gradient-to-b from-white to-[#FAF6F0] border-[#EADBCE]">
              <CardHeader className="border-b border-[#F2EAE0]">
                <div className="flex items-center gap-2 text-[#8B5E3C]">
                  <Calculator className="w-5 h-5 text-[#D97745]" />
                  <CardTitle>Real-Time Cost Preview</CardTitle>
                </div>
                <CardDescription>Live math calculated per base batch</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#766B62]">
                    <span>Raw Ingredients:</span>
                    <span className="font-semibold text-[#2F2924]">
                      {formatCurrency(estimatedIngredientCost)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#766B62]">
                    <span>Kitchen Overheads:</span>
                    <span className="font-semibold text-[#2F2924]">
                      {formatCurrency(overheadsTotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#766B62]">
                    <span>Wastage Allowance:</span>
                    <span className="font-semibold text-[#2F2924]">
                      {formatCurrency(wastageEst)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#EADBCE] flex justify-between font-bold text-sm text-[#2F2924]">
                    <span>Total Batch Cost:</span>
                    <span className="text-[#8B5E3C]">{formatCurrency(totalEstCost)}</span>
                  </div>

                  <div className="flex justify-between text-xs text-[#766B62]">
                    <span>Cost per {servingUnit || "unit"}:</span>
                    <span className="font-semibold">{formatCurrency(costPerServ)}</span>
                  </div>
                </div>

                {/* Selling Price Input */}
                <div className="pt-3 border-t border-[#F2EAE0]">
                  <Input
                    label="Target Selling Price (₹)"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 700"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    helper="Break-even price: "
                  />
                </div>

                {/* Margins Result Box */}
                {sellPriceNum > 0 && (
                  <div
                    className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                      estMargin >= 40
                        ? "bg-[#F0F6EE] border-[#6F8F5F]/40"
                        : estMargin > 0
                        ? "bg-[#FEF9F0] border-[#E7B86A]/40"
                        : "bg-[#FEF4F2] border-[#D97745]/40"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#594E46]">Est. Net Profit:</span>
                      <span className="font-bold text-sm text-[#2F2924]">
                        {formatCurrency(estProfit)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#594E46]">Profit Margin:</span>
                      <span className="font-bold text-base text-[#D97745]">
                        {estMargin}%
                      </span>
                    </div>

                    <div className="text-[11px] text-[#766B62] mt-1">
                      {estMargin >= 50
                        ? "🌟 Healthy gourmet margin!"
                        : estMargin >= 30
                        ? "✅ Standard bakery margin."
                        : "⚠️ Low margin. Consider adjusting price or portions."}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full text-sm font-semibold mt-2 shadow-md"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Recipe
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
