"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchIngredients,
  createIngredient,
  updateIngredient,
  updateIngredientPrice,
  fetchPriceHistory,
  deleteIngredient,
} from "@/lib/redux/slices/ingredientsSlice";
import { recordPurchase, fetchValuation, fetchLowStock } from "@/lib/redux/slices/inventorySlice";
import { fetchRecipes } from "@/lib/redux/slices/recipesSlice";
import { addToast } from "@/lib/redux/slices/uiSlice";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { formatCurrency, formatNumber, formatDate, UNIT_OPTIONS } from "@/lib/utils";
import { Ingredient, PriceHistoryItem } from "@/types";
import {
  Wheat,
  Plus,
  Search,
  AlertTriangle,
  History,
  TrendingUp,
  ShoppingBag,
  Trash2,
  Edit2,
  CheckCircle2,
  DollarSign,
  Layers,
} from "lucide-react";

export default function IngredientsPage() {
  const dispatch = useAppDispatch();
  const { items, isLoading, priceHistory, isHistoryLoading } = useAppSelector(
    (state) => state.ingredients
  );

  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeIngredient, setActiveIngredient] = useState<Ingredient | null>(null);

  // Add Form state
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kg");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseQuantity, setPurchaseQuantity] = useState("1");
  const [openingQuantity, setOpeningQuantity] = useState("");
  const [minimumStockLevel, setMinimumStockLevel] = useState("");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");

  // Price Update Form state
  const [newPrice, setNewPrice] = useState("");
  const [newPurchaseQuantity, setNewPurchaseQuantity] = useState("1");
  const [priceNote, setPriceNote] = useState("");

  // Restock Form state
  const [restockQty, setRestockQty] = useState("");
  const [restockTotalCost, setRestockTotalCost] = useState("");
  const [updatePriceOnRestock, setUpdatePriceOnRestock] = useState(true);

  useEffect(() => {
    dispatch(fetchIngredients({ search, lowStock: lowStockOnly }));
  }, [dispatch, search, lowStockOnly]);

  // Handle Add Ingredient
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        createIngredient({
          name,
          unit,
          purchasePrice: Number(purchasePrice),
          purchaseQuantity: Number(purchaseQuantity),
          openingQuantity: openingQuantity ? Number(openingQuantity) : undefined,
          minimumStockLevel: minimumStockLevel ? Number(minimumStockLevel) : undefined,
          supplier: supplier || undefined,
          notes: notes || undefined,
        })
      ).unwrap();

      dispatch(
        addToast({
          type: "success",
          title: "Ingredient Added",
          message: `${name} has been added to your pantry catalog.`,
        })
      );

      setIsAddModalOpen(false);
      resetAddForm();
      dispatch(fetchValuation());
    } catch (err: any) {
      dispatch(addToast({ type: "error", title: "Failed to Add", message: err }));
    }
  };

  const resetAddForm = () => {
    setName("");
    setUnit("kg");
    setPurchasePrice("");
    setPurchaseQuantity("1");
    setOpeningQuantity("");
    setMinimumStockLevel("");
    setSupplier("");
    setNotes("");
  };

  // Handle Update Price
  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIngredient) return;

    try {
      const res = await dispatch(
        updateIngredientPrice({
          id: activeIngredient._id,
          data: {
            purchasePrice: Number(newPrice),
            purchaseQuantity: Number(newPurchaseQuantity),
            unit: activeIngredient.unit,
            note: priceNote || undefined,
          },
        })
      ).unwrap();

      dispatch(
        addToast({
          type: "success",
          title: "Rate Updated",
          message: `Updated rate for ${activeIngredient.name}. ${res.affectedRecipes || 0} recipes recalibrated with live costs!`,
        })
      );

      setIsPriceModalOpen(false);
      setNewPrice("");
      setPriceNote("");
      dispatch(fetchRecipes({ withCost: true }));
      dispatch(fetchValuation());
    } catch (err: any) {
      dispatch(addToast({ type: "error", title: "Rate Update Failed", message: err }));
    }
  };

  // Handle Restock
  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIngredient) return;

    try {
      await dispatch(
        recordPurchase({
          ingredientId: activeIngredient._id,
          quantity: Number(restockQty),
          unit: activeIngredient.unit,
          totalCost: restockTotalCost ? Number(restockTotalCost) : undefined,
          updatePrice: updatePriceOnRestock,
        })
      ).unwrap();

      dispatch(
        addToast({
          type: "success",
          title: "Pantry Restocked",
          message: `Added ${restockQty} ${activeIngredient.unit} of ${activeIngredient.name} to stock.`,
        })
      );

      setIsRestockModalOpen(false);
      setRestockQty("");
      setRestockTotalCost("");
      dispatch(fetchIngredients({ search, lowStock: lowStockOnly }));
      dispatch(fetchLowStock());
      dispatch(fetchValuation());
      if (updatePriceOnRestock) {
        dispatch(fetchRecipes({ withCost: true }));
      }
    } catch (err: any) {
      dispatch(addToast({ type: "error", title: "Restock Failed", message: err }));
    }
  };

  // View Price History
  const openHistory = (ing: Ingredient) => {
    setActiveIngredient(ing);
    dispatch(fetchPriceHistory(ing._id));
    setIsHistoryModalOpen(true);
  };

  // Delete ingredient
  const handleDelete = async (ing: Ingredient) => {
    if (confirm(`Archive ${ing.name} from your pantry?`)) {
      try {
        await dispatch(deleteIngredient({ id: ing._id })).unwrap();
        dispatch(
          addToast({
            type: "success",
            title: "Ingredient Archived",
            message: `${ing.name} has been removed from active pantry items.`,
          })
        );
      } catch (err: any) {
        dispatch(addToast({ type: "error", title: "Cannot Delete", message: err }));
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
                Pantry Ingredients & Rates
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F5EFEB] text-[#8B5E3C] border border-[#8B5E3C]/20">
                {items.length} items
              </span>
            </div>
            <p className="text-sm text-[#766B62] mt-1">
              Live market purchase rates, internal base units, stock levels and supplier tracking.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              resetAddForm();
              setIsAddModalOpen(true);
            }}
            className="gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Ingredient</span>
          </Button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white border border-[#EADBCE] rounded-2xl shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#9C8F84]" />
            <input
              type="text"
              placeholder="Search ingredient, supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EADBCE] text-sm text-[#2F2924] bg-[#FAF6F0]/40 focus:bg-white focus:border-[#D97745] focus:outline-none focus:ring-2 focus:ring-[#D97745]/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                lowStockOnly
                  ? "bg-[#FEF9F0] border-[#E7B86A] text-[#A07324] font-semibold"
                  : "bg-white border-[#EADBCE] text-[#766B62] hover:bg-[#FAF6F0]"
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${lowStockOnly ? "text-[#D97745]" : ""}`} />
              <span>Low Stock Only</span>
            </button>
          </div>
        </div>

        {/* Ingredients Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[#766B62]">Loading ingredients...</div>
        ) : items.length === 0 ? (
          <div className="p-12 bg-white border border-[#EADBCE] rounded-2xl text-center">
            <Wheat className="w-12 h-12 text-[#D9C4B0] mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-lg text-[#2F2924]">No Ingredients Found</h3>
            <p className="text-xs text-[#766B62] mt-1 mb-4">
              {search ? "No ingredients match your search query." : "Your pantry is empty. Add your first ingredient to begin costing."}
            </p>
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
              Add Ingredient
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {items.map((ing) => {
              const isLow = ing.isLowStock;
              return (
                <Card key={ing._id} className="flex flex-col justify-between hover:border-[#D97745]/40 transition-all">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-[#2F2924] leading-tight">
                          {ing.name}
                        </h3>
                        {ing.supplier && (
                          <span className="text-xs text-[#8C8075] mt-0.5 block">
                            Supplier: {ing.supplier}
                          </span>
                        )}
                      </div>

                      {isLow ? (
                        <Badge variant="warning" size="sm">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock</span>
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>In Stock</span>
                        </Badge>
                      )}
                    </div>

                    {/* Stock & Valuation Stats */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-[#FAF6F0] rounded-xl border border-[#F2EAE0] mb-4 text-xs">
                      <div>
                        <span className="text-[#8C8075] block text-[11px]">Current Stock</span>
                        <span className="font-bold text-[#2F2924] text-sm">
                          {formatNumber(ing.currentQuantityInUnit || 0)} {ing.unit}
                        </span>
                        <span className="text-[10px] text-[#8C8075] block">
                          ({formatNumber(ing.currentQuantity)} {ing.baseUnit})
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8C8075] block text-[11px]">Stock Valuation</span>
                        <span className="font-bold text-[#8B5E3C] text-sm">
                          {formatCurrency(ing.stockValue || 0)}
                        </span>
                        <span className="text-[10px] text-[#8C8075] block">
                          Min: {ing.minimumStockLevel || 0} {ing.unit}
                        </span>
                      </div>
                    </div>

                    {/* Pricing Math Rate */}
                    <div className="flex items-center justify-between text-xs py-1 border-t border-[#F2EAE0]">
                      <span className="text-[#766B62]">Purchase Rate:</span>
                      <span className="font-semibold text-[#2F2924]">
                        {formatCurrency(ing.purchasePrice)} / {ing.purchaseQuantity} {ing.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-[#766B62]">Base Kitchen Rate:</span>
                      <span className="font-bold text-[#D97745]">
                        {formatCurrency(ing.costPerBaseUnit)} / {ing.baseUnit}
                      </span>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="px-5 py-3 bg-[#FDFBF7] border-t border-[#F2EAE0] rounded-b-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openHistory(ing)}
                        title="View Price History"
                        className="p-1.5 rounded-lg text-[#766B62] hover:text-[#8B5E3C] hover:bg-[#EFE8DE] transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ing)}
                        title="Archive Ingredient"
                        className="p-1.5 rounded-lg text-[#8C8075] hover:text-[#C04838] hover:bg-[#FEF4F2] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveIngredient(ing);
                          setNewPrice(ing.purchasePrice.toString());
                          setNewPurchaseQuantity(ing.purchaseQuantity.toString());
                          setIsPriceModalOpen(true);
                        }}
                        className="text-xs h-8 px-2.5"
                      >
                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                        <span>Update Rate</span>
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setActiveIngredient(ing);
                          setRestockQty("");
                          setRestockTotalCost("");
                          setIsRestockModalOpen(true);
                        }}
                        className="text-xs h-8 px-2.5 gap-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal: Add New Ingredient */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Pantry Ingredient"
          description="Define purchase rate and unit. Kitchen Math will automatically standardize it into base units."
          maxWidth="md"
        >
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
            <Input
              label="Ingredient Name"
              placeholder="e.g. Belgian Dark Chocolate 70%"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Purchase Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                options={UNIT_OPTIONS}
              />

              <Input
                label="Purchase Quantity"
                type="number"
                min="0.001"
                step="any"
                placeholder="1"
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Purchase Price (₹)"
                type="number"
                min="0"
                step="any"
                placeholder="500"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                required
              />

              <Input
                label="Initial Opening Stock"
                type="number"
                min="0"
                step="any"
                placeholder="5"
                value={openingQuantity}
                onChange={(e) => setOpeningQuantity(e.target.value)}
                helper={`Expressed in ${unit}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Stock Warning Level"
                type="number"
                min="0"
                step="any"
                placeholder="1"
                value={minimumStockLevel}
                onChange={(e) => setMinimumStockLevel(e.target.value)}
                helper={`Alert when below this in ${unit}`}
              />

              <Input
                label="Supplier Name"
                placeholder="e.g. Sweet Supplies Co."
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </div>

            <Textarea
              label="Notes"
              placeholder="Storage instructions, brand, or shelf life notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2EAE0]">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Ingredient
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Update Price / Market Rate */}
        <Modal
          isOpen={isPriceModalOpen}
          onClose={() => setIsPriceModalOpen(false)}
          title={`Update Market Rate: ${activeIngredient?.name}`}
          description="Adjust the purchase price. Existing stock quantity remains unchanged. All active recipes will cost with the new rate."
          maxWidth="md"
        >
          <form onSubmit={handlePriceSubmit} className="flex flex-col gap-4">
            <div className="p-3 bg-[#FEF9F0] border border-[#E7B86A]/40 rounded-xl text-xs text-[#8C601E]">
              Current Base Rate: <span className="font-bold">{formatCurrency(activeIngredient?.costPerBaseUnit)}/{activeIngredient?.baseUnit}</span> ({formatCurrency(activeIngredient?.purchasePrice)} per {activeIngredient?.purchaseQuantity} {activeIngredient?.unit})
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label={`New Price (₹)`}
                type="number"
                min="0"
                step="any"
                placeholder="600"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
              />

              <Input
                label={`Quantity (${activeIngredient?.unit})`}
                type="number"
                min="0.001"
                step="any"
                value={newPurchaseQuantity}
                onChange={(e) => setNewPurchaseQuantity(e.target.value)}
                required
              />
            </div>

            <Input
              label="Reason / Supplier Note"
              placeholder="e.g. Supplier hike due to seasonal demand"
              value={priceNote}
              onChange={(e) => setPriceNote(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2EAE0]">
              <Button type="button" variant="outline" onClick={() => setIsPriceModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Apply New Rate
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Quick Restock / Purchase */}
        <Modal
          isOpen={isRestockModalOpen}
          onClose={() => setIsRestockModalOpen(false)}
          title={`Restock Pantry: ${activeIngredient?.name}`}
          description={`Log a purchase receipt to increase stock of ${activeIngredient?.name}.`}
          maxWidth="md"
        >
          <form onSubmit={handleRestockSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={`Quantity to Add (${activeIngredient?.unit})`}
                type="number"
                min="0.001"
                step="any"
                placeholder="2"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                required
              />

              <Input
                label="Total Cost Paid (₹)"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 1100"
                value={restockTotalCost}
                onChange={(e) => setRestockTotalCost(e.target.value)}
                helper="Leave blank to use current rate"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-[#2F2924] cursor-pointer">
              <input
                type="checkbox"
                checked={updatePriceOnRestock}
                onChange={(e) => setUpdatePriceOnRestock(e.target.checked)}
                className="rounded text-[#D97745] focus:ring-[#D97745]"
              />
              <span>Update ingredient rate to this purchase&apos;s unit price</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2EAE0]">
              <Button type="button" variant="outline" onClick={() => setIsRestockModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Confirm Restock
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Price History */}
        <Modal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          title={`Price History: ${activeIngredient?.name}`}
          description="Audit trail of price changes and their origin."
          maxWidth="md"
        >
          {isHistoryLoading ? (
            <div className="p-8 text-center text-xs text-[#766B62]">Loading price history...</div>
          ) : priceHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#766B62]">No price changes logged yet.</div>
          ) : (
            <div className="divide-y divide-[#F2EAE0] max-h-96 overflow-y-auto">
              {priceHistory.map((h) => (
                <div key={h._id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#2F2924]">
                        {formatCurrency(h.newCostPerBaseUnit)}/{activeIngredient?.baseUnit}
                      </span>
                      {h.previousCostPerBaseUnit && (
                        <span className="text-[#8C8075] line-through">
                          {formatCurrency(h.previousCostPerBaseUnit)}/{activeIngredient?.baseUnit}
                        </span>
                      )}
                    </div>
                    {h.note && <p className="text-[#766B62] mt-0.5">{h.note}</p>}
                    <span className="text-[10px] text-[#8C8075] block mt-0.5">
                      {formatDate(h.createdAt)} • Source: {h.source}
                    </span>
                  </div>
                  <Badge variant={h.source === "PURCHASE" ? "accent" : "primary"} size="sm">
                    {h.source}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}
