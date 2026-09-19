"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchTransactions,
  fetchValuation,
  fetchLowStock,
  recordPurchase,
  recordAdjustment,
  recordWastage,
} from "@/lib/redux/slices/inventorySlice";
import { fetchIngredients } from "@/lib/redux/slices/ingredientsSlice";
import { fetchRecipes } from "@/lib/redux/slices/recipesSlice";
import { addToast } from "@/lib/redux/slices/uiSlice";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { formatCurrency, formatNumber, formatDateTime, formatDate } from "@/lib/utils";
import {
  Boxes,
  ShoppingBag,
  SlidersHorizontal,
  Trash,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  RefreshCw,
  Search,
  Receipt,
  RotateCcw,
} from "lucide-react";

export default function InventoryPage() {
  const dispatch = useAppDispatch();
  const { items: ingredients } = useAppSelector((state) => state.ingredients);
  const {
    transactions,
    transactionsMeta,
    valuation,
    lowStockItems,
    isLoading,
    isValuationLoading,
  } = useAppSelector((state) => state.inventory);

  const [typeFilter, setTypeFilter] = useState<string>("");
  const [selectedIngredientFilter, setSelectedIngredientFilter] = useState<string>("");

  // Modals
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isWastageModalOpen, setIsWastageModalOpen] = useState(false);

  // Purchase Form
  const [purchaseIngId, setPurchaseIngId] = useState("");
  const [purchaseQty, setPurchaseQty] = useState("");
  const [purchaseTotalCost, setPurchaseTotalCost] = useState("");
  const [purchaseUpdateRate, setPurchaseUpdateRate] = useState(true);
  const [purchaseNote, setPurchaseNote] = useState("");

  // Adjust Form
  const [adjustIngId, setAdjustIngId] = useState("");
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [allowNegative, setAllowNegative] = useState(false);

  // Wastage Form
  const [wastageIngId, setWastageIngId] = useState("");
  const [wastageQty, setWastageQty] = useState("");
  const [wastageReason, setWastageReason] = useState("");

  useEffect(() => {
    dispatch(fetchIngredients());
    dispatch(fetchValuation());
    dispatch(fetchLowStock());
    dispatch(
      fetchTransactions({
        type: typeFilter || undefined,
        ingredientId: selectedIngredientFilter || undefined,
      })
    );
  }, [dispatch, typeFilter, selectedIngredientFilter]);

  // Initial form values
  useEffect(() => {
    if (ingredients.length > 0) {
      if (!purchaseIngId) setPurchaseIngId(ingredients[0]._id);
      if (!adjustIngId) setAdjustIngId(ingredients[0]._id);
      if (!wastageIngId) setWastageIngId(ingredients[0]._id);
    }
  }, [ingredients, purchaseIngId, adjustIngId, wastageIngId]);

  // Handle Purchase Submit
  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selected = ingredients.find((i) => i._id === purchaseIngId);
      await dispatch(
        recordPurchase({
          ingredientId: purchaseIngId,
          quantity: Number(purchaseQty),
          unit: selected?.unit,
          totalCost: purchaseTotalCost ? Number(purchaseTotalCost) : undefined,
          updatePrice: purchaseUpdateRate,
          note: purchaseNote || undefined,
        })
      ).unwrap();

      dispatch(
        addToast({
          type: "success",
          title: "Purchase Logged",
          message: `Added ${purchaseQty} ${selected?.unit} of ${selected?.name} to inventory.`,
        })
      );

      setIsPurchaseModalOpen(false);
      setPurchaseQty("");
      setPurchaseTotalCost("");
      setPurchaseNote("");
      refreshAll();
    } catch (err: any) {
      dispatch(addToast({ type: "error", title: "Purchase Failed", message: err }));
    }
  };

  // Handle Adjust Submit
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selected = ingredients.find((i) => i._id === adjustIngId);
      await dispatch(
        recordAdjustment({
          ingredientId: adjustIngId,
          quantity: Number(adjustQty),
          unit: selected?.unit,
          reason: adjustReason,
          allowNegative,
        })
      ).unwrap();

      dispatch(
        addToast({
          type: "success",
          title: "Stock Adjusted",
          message: `Stock for ${selected?.name} adjusted by ${adjustQty} ${selected?.unit}.`,
        })
      );

      setIsAdjustModalOpen(false);
      setAdjustQty("");
      setAdjustReason("");
      refreshAll();
    } catch (err: any) {
      dispatch(addToast({ type: "error", title: "Adjustment Failed", message: err }));
    }
  };

  // Handle Wastage Submit
  const handleWastageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selected = ingredients.find((i) => i._id === wastageIngId);
      await dispatch(
        recordWastage({
          ingredientId: wastageIngId,
          quantity: Number(wastageQty),
          unit: selected?.unit,
          reason: wastageReason,
        })
      ).unwrap();

      dispatch(
        addToast({
          type: "warning",
          title: "Wastage Recorded",
          message: `Recorded ${wastageQty} ${selected?.unit} of ${selected?.name} as kitchen wastage.`,
        })
      );

      setIsWastageModalOpen(false);
      setWastageQty("");
      setWastageReason("");
      refreshAll();
    } catch (err: any) {
      dispatch(addToast({ type: "error", title: "Wastage Failed", message: err }));
    }
  };

  const refreshAll = () => {
    dispatch(fetchIngredients());
    dispatch(fetchValuation());
    dispatch(fetchLowStock());
    dispatch(fetchRecipes({ withCost: true }));
    dispatch(
      fetchTransactions({
        type: typeFilter || undefined,
        ingredientId: selectedIngredientFilter || undefined,
      })
    );
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return <Badge variant="accent">Purchase (+)</Badge>;
      case "PRODUCTION_CONSUMPTION":
        return <Badge variant="primary">Batch Cook (-)</Badge>;
      case "PRODUCTION_REVERSAL":
        return <Badge variant="success">Restored (+)</Badge>;
      case "WASTAGE":
        return <Badge variant="warning">Wastage (-)</Badge>;
      case "ADJUSTMENT":
        return <Badge variant="muted">Adjustment</Badge>;
      case "OPENING_STOCK":
        return <Badge variant="outline">Opening Stock</Badge>;
      default:
        return <Badge variant="muted">{type}</Badge>;
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#2F2924] tracking-tight">
              Stockroom & Inventory Ledger
            </h1>
            <p className="text-sm text-[#766B62] mt-1">
              Audit trails, stock adjustments, purchase intakes and real-time inventory valuation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWastageModalOpen(true)}
              className="gap-1.5"
            >
              <Trash className="w-3.5 h-3.5 text-[#C04838]" />
              <span>Log Wastage</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdjustModalOpen(true)}
              className="gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span>Stock Count Adjust</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPurchaseModalOpen(true)}
              className="gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Log Purchase</span>
            </Button>
          </div>
        </div>

        {/* Valuation Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-6 bg-gradient-to-br from-white to-[#FAF6F0] md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider">
                  Total Asset Valuation
                </span>
                <div className="text-3xl font-bold font-heading text-[#2F2924] mt-1">
                  {formatCurrency(valuation?.totalStockValue || 0)}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#F5EFEB] text-[#8B5E3C] flex items-center justify-center">
                <Boxes className="w-6 h-6" />
              </div>
            </div>

            {/* Breakdown progress / preview */}
            <div className="space-y-2 mt-4 pt-4 border-t border-[#F2EAE0]">
              <span className="text-xs font-semibold text-[#766B62]">Top Value Contributors:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {valuation?.breakdown?.slice(0, 6).map((b) => (
                  <div key={b.ingredientId} className="p-2.5 rounded-xl bg-white border border-[#EADBCE] text-xs">
                    <p className="font-semibold text-[#2F2924] truncate">{b.name}</p>
                    <p className="text-[#8B5E3C] font-bold mt-0.5">{formatCurrency(b.stockValue)}</p>
                    <p className="text-[10px] text-[#766B62]">{formatNumber(b.quantity)} {b.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Low Stock Watchlist */}
          <Card className="p-6 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#A07324] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#D97745]" />
                  <span>Reorder Watchlist</span>
                </span>
                <Badge variant="warning">{lowStockItems.length}</Badge>
              </div>

              {lowStockItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#766B62]">
                  No low stock alerts. All ingredients above reorder threshold.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {lowStockItems.map((item) => (
                    <div
                      key={item._id}
                      className="p-2.5 rounded-xl bg-[#FEFAF3] border border-[#F5ECCF] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[#2F2924]">{item.name}</p>
                        <p className="text-[11px] text-[#A07324]">
                          Stock: {formatNumber(item.currentQuantityInUnit || 0)} {item.unit} (Min: {item.minimumStockLevel})
                        </p>
                      </div>
                      <Button
                        variant="honey"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => {
                          setPurchaseIngId(item._id);
                          setIsPurchaseModalOpen(true);
                        }}
                      >
                        Restock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#8C8075] mt-4 pt-3 border-t border-[#F2EAE0]">
              Alerts trigger when quantity ≤ defined minimum stock level.
            </p>
          </Card>
        </div>

        {/* Transaction Ledger Table Card */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Inventory Transaction Ledger</CardTitle>
              <CardDescription>
                Immutable audit history of all purchases, production deductions, wastage, and manual counts.
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs rounded-xl border border-[#EADBCE] bg-white px-3 py-2 text-[#2F2924] focus:outline-none focus:border-[#D97745]"
              >
                <option value="">All Transaction Types</option>
                <option value="PURCHASE">Purchases</option>
                <option value="PRODUCTION_CONSUMPTION">Batch Cooking</option>
                <option value="PRODUCTION_REVERSAL">Cancelled Batch Reversals</option>
                <option value="WASTAGE">Wastage</option>
                <option value="ADJUSTMENT">Adjustments</option>
                <option value="OPENING_STOCK">Opening Stock</option>
              </select>

              <select
                value={selectedIngredientFilter}
                onChange={(e) => setSelectedIngredientFilter(e.target.value)}
                className="text-xs rounded-xl border border-[#EADBCE] bg-white px-3 py-2 text-[#2F2924] focus:outline-none focus:border-[#D97745]"
              >
                <option value="">All Ingredients</option>
                {ingredients.map((ing) => (
                  <option key={ing._id} value={ing._id}>
                    {ing.name}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#766B62]">Loading transaction records...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#766B62]">
                No inventory transactions logged for the selected filter.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6F0] border-b border-[#F2EAE0] text-[#766B62] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">Ingredient</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5 text-right">Qty Change</th>
                    <th className="px-5 py-3.5 text-right">Stock Level (After)</th>
                    <th className="px-5 py-3.5 text-right">Total Cost</th>
                    <th className="px-5 py-3.5">Reason / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EAE0]">
                  {transactions.map((tx) => {
                    const isPositive = tx.quantity > 0;
                    return (
                      <tr key={tx._id} className="hover:bg-[#FDFBF7] transition-colors">
                        <td className="px-5 py-3 text-[#766B62] whitespace-nowrap">
                          {formatDateTime(tx.createdAt)}
                        </td>
                        <td className="px-5 py-3 font-semibold text-[#2F2924] whitespace-nowrap">
                          {tx.ingredient?.name || "Ingredient"}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {getTransactionBadge(tx.type)}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold whitespace-nowrap">
                          <span
                            className={
                              isPositive ? "text-[#6F8F5F]" : "text-[#C04838]"
                            }
                          >
                            {isPositive ? "+" : ""}
                            {formatNumber(tx.quantity)} {tx.unit}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-[#766B62] whitespace-nowrap">
                          {formatNumber(tx.quantityAfter)} {tx.unit}
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-[#2F2924] whitespace-nowrap">
                          {formatCurrency(tx.totalCost)}
                        </td>
                        <td className="px-5 py-3 text-[#766B62] max-w-xs truncate">
                          {tx.reason || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Modal: Log Purchase */}
        <Modal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          title="Record Ingredient Purchase"
          description="Add stock and optionally refresh ingredient market rate."
          maxWidth="md"
        >
          <form onSubmit={handlePurchaseSubmit} className="flex flex-col gap-4">
            <Select
              label="Select Ingredient"
              value={purchaseIngId}
              onChange={(e) => setPurchaseIngId(e.target.value)}
              options={ingredients.map((i) => ({
                label: `${i.name} (unit: ${i.unit})`,
                value: i._id,
              }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantity to Add"
                type="number"
                min="0.001"
                step="any"
                placeholder="2"
                value={purchaseQty}
                onChange={(e) => setPurchaseQty(e.target.value)}
                required
              />

              <Input
                label="Total Cost Paid (₹)"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 1100"
                value={purchaseTotalCost}
                onChange={(e) => setPurchaseTotalCost(e.target.value)}
                helper="Used to calculate new rate"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-[#2F2924] cursor-pointer">
              <input
                type="checkbox"
                checked={purchaseUpdateRate}
                onChange={(e) => setPurchaseUpdateRate(e.target.checked)}
                className="rounded text-[#D97745] focus:ring-[#D97745]"
              />
              <span>Recalibrate ingredient market rate with this purchase</span>
            </label>

            <Input
              label="Purchase Note / Invoice"
              placeholder="e.g. Wholesale supplier batch #481"
              value={purchaseNote}
              onChange={(e) => setPurchaseNote(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2EAE0]">
              <Button type="button" variant="outline" onClick={() => setIsPurchaseModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Record Purchase
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Adjust Stock */}
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title="Stock Count Adjustment"
          description="Correct discrepancies between physical pantry counts and digital records."
          maxWidth="md"
        >
          <form onSubmit={handleAdjustSubmit} className="flex flex-col gap-4">
            <Select
              label="Select Ingredient"
              value={adjustIngId}
              onChange={(e) => setAdjustIngId(e.target.value)}
              options={ingredients.map((i) => ({
                label: `${i.name} (Current: ${formatNumber(i.currentQuantityInUnit || 0)} ${i.unit})`,
                value: i._id,
              }))}
            />

            <Input
              label="Quantity Adjustment (+ or -)"
              type="number"
              step="any"
              placeholder="e.g. -0.25 to deduct or 1.5 to add"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              required
              helper="Positive numbers add stock; negative numbers deduct stock"
            />

            <Input
              label="Reason for Adjustment"
              placeholder="e.g. Weekly physical inventory count discrepancy"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              required
            />

            <label className="flex items-center gap-2 text-xs text-[#2F2924] cursor-pointer">
              <input
                type="checkbox"
                checked={allowNegative}
                onChange={(e) => setAllowNegative(e.target.checked)}
                className="rounded text-[#D97745] focus:ring-[#D97745]"
              />
              <span>Allow stock to drop below zero if count was negative</span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2EAE0]">
              <Button type="button" variant="outline" onClick={() => setIsAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Apply Adjustment
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Log Wastage */}
        <Modal
          isOpen={isWastageModalOpen}
          onClose={() => setIsWastageModalOpen(false)}
          title="Record Kitchen Wastage"
          description="Log spoiled, dropped, or expired ingredients for waste tracking."
          maxWidth="md"
        >
          <form onSubmit={handleWastageSubmit} className="flex flex-col gap-4">
            <Select
              label="Select Ingredient"
              value={wastageIngId}
              onChange={(e) => setWastageIngId(e.target.value)}
              options={ingredients.map((i) => ({
                label: `${i.name} (Current: ${formatNumber(i.currentQuantityInUnit || 0)} ${i.unit})`,
                value: i._id,
              }))}
            />

            <Input
              label="Wasted Quantity"
              type="number"
              min="0.001"
              step="any"
              placeholder="e.g. 0.5"
              value={wastageQty}
              onChange={(e) => setWastageQty(e.target.value)}
              required
            />

            <Input
              label="Reason for Wastage"
              placeholder="e.g. Broken eggs during prep / spoiled milk"
              value={wastageReason}
              onChange={(e) => setWastageReason(e.target.value)}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2EAE0]">
              <Button type="button" variant="outline" onClick={() => setIsWastageModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-[#C04838] hover:bg-[#A83729]">
                Record Wastage
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
