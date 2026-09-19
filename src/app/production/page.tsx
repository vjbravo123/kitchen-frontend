"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchProductionList,
  fetchProductionSummary,
  cancelProduction,
} from "@/lib/redux/slices/productionSlice";
import { fetchIngredients } from "@/lib/redux/slices/ingredientsSlice";
import { fetchLowStock, fetchValuation } from "@/lib/redux/slices/inventorySlice";
import { openQuickBatchModal, addToast } from "@/lib/redux/slices/uiSlice";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatNumber, formatDateTime, formatDate } from "@/lib/utils";
import {
  Flame,
  RotateCcw,
  Calendar,
  TrendingUp,
  DollarSign,
  ChefHat,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";

export default function ProductionPage() {
  const dispatch = useAppDispatch();
  const { records, summary, isLoading, isSummaryLoading } = useAppSelector(
    (state) => state.production
  );

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    dispatch(
      fetchProductionList({
        status: (statusFilter as any) || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      })
    );
    dispatch(
      fetchProductionSummary({
        from: fromDate || undefined,
        to: toDate || undefined,
      })
    );
  }, [dispatch, statusFilter, fromDate, toDate]);

  const handleCancelBatch = async (recordId: string, recipeName: string) => {
    if (
      confirm(
        `Cancel this batch of "${recipeName}"? The exact quantities of all ingredients will be automatically restored back to your pantry inventory.`
      )
    ) {
      try {
        await dispatch(cancelProduction(recordId)).unwrap();
        dispatch(
          addToast({
            type: "success",
            title: "Batch Cancelled",
            message: `Batch cancelled and ingredients restored to stock.`,
          })
        );
        dispatch(fetchIngredients());
        dispatch(fetchLowStock());
        dispatch(fetchValuation());
      } catch (err: any) {
        dispatch(addToast({ type: "error", title: "Cancellation Failed", message: err }));
      }
    }
  };

  const totals = summary?.totals;

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#2F2924] tracking-tight">
              Kitchen Production & Bake Log
            </h1>
            <p className="text-sm text-[#766B62] mt-1">
              Historical batches cooked, atomic stock deduction records, revenue and profit performance.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => dispatch(openQuickBatchModal())}
            className="gap-2 shadow-sm"
          >
            <Flame className="w-4 h-4" />
            <span>Cook New Batch</span>
          </Button>
        </div>

        {/* Date Filter Bar */}
        <div className="p-4 bg-white border border-[#EADBCE] rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#8B5E3C]" />
            <span className="font-semibold text-[#594E46]">Date Filter:</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-xl border border-[#EADBCE] bg-[#FAF6F0]/40 px-3 py-1.5 text-xs text-[#2F2924]"
            />
            <span className="text-[#766B62]">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-xl border border-[#EADBCE] bg-[#FAF6F0]/40 px-3 py-1.5 text-xs text-[#2F2924]"
            />

            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="text-xs font-semibold text-[#D97745] hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Summary Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-5 bg-white">
            <span className="text-xs font-semibold text-[#766B62] uppercase tracking-wider block">
              Total Batches
            </span>
            <div className="text-2xl font-bold font-heading text-[#2F2924] mt-1">
              {totals?.batches || 0}
            </div>
            <p className="text-xs text-[#766B62] mt-0.5">
              {totals?.servings || 0} total servings
            </p>
          </Card>

          <Card className="p-4 sm:p-5 bg-white">
            <span className="text-xs font-semibold text-[#766B62] uppercase tracking-wider block">
              Production Cost
            </span>
            <div className="text-2xl font-bold font-heading text-[#2F2924] mt-1">
              {formatCurrency(totals?.totalCost || 0)}
            </div>
            <p className="text-xs text-[#766B62] mt-0.5">Raw materials & overheads</p>
          </Card>

          <Card className="p-4 sm:p-5 bg-white">
            <span className="text-xs font-semibold text-[#766B62] uppercase tracking-wider block">
              Sales Revenue
            </span>
            <div className="text-2xl font-bold font-heading text-[#D97745] mt-1">
              {formatCurrency(totals?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-[#766B62] mt-0.5">Billed to customers</p>
          </Card>

          <Card className="p-4 sm:p-5 bg-white">
            <span className="text-xs font-semibold text-[#6F8F5F] uppercase tracking-wider block">
              Net Profit
            </span>
            <div className="text-2xl font-bold font-heading text-[#6F8F5F] mt-1">
              {formatCurrency(totals?.totalProfit || 0)}
            </div>
            <p className="text-xs text-[#6F8F5F] font-semibold mt-0.5">
              {totals?.overallMarginPercent || 0}% overall profit margin
            </p>
          </Card>
        </div>

        {/* Batches Table Card */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Kitchen Production Ledger</CardTitle>
              <CardDescription>
                Historical record of batches prepared. Quantities and profit snapshots are permanently locked at production time.
              </CardDescription>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-xl border border-[#EADBCE] bg-white px-3 py-2 text-[#2F2924] focus:outline-none focus:border-[#D97745]"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled (Restored)</option>
            </select>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#766B62]">Loading production log...</div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#766B62]">
                No production batches found for this period. Click &quot;Cook New Batch&quot; above to log your first order!
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6F0] border-b border-[#F2EAE0] text-[#766B62] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Prepared At</th>
                    <th className="px-5 py-3.5">Recipe</th>
                    <th className="px-5 py-3.5">Servings</th>
                    <th className="px-5 py-3.5 text-right">Total Cost</th>
                    <th className="px-5 py-3.5 text-right">Selling Price</th>
                    <th className="px-5 py-3.5 text-right">Net Profit</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EAE0]">
                  {records.map((rec) => {
                    const isCompleted = rec.status === "COMPLETED";
                    return (
                      <tr key={rec._id} className="hover:bg-[#FDFBF7] transition-colors">
                        <td className="px-5 py-3.5 text-[#766B62] whitespace-nowrap">
                          {formatDateTime(rec.preparedAt || rec.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-[#2F2924] whitespace-nowrap">
                          <div>{rec.recipeName}</div>
                          {rec.notes && <p className="text-[11px] text-[#8C8075] font-normal">{rec.notes}</p>}
                        </td>
                        <td className="px-5 py-3.5 text-[#2F2924] whitespace-nowrap">
                          {rec.servings} serving(s)
                        </td>
                        <td className="px-5 py-3.5 text-right text-[#766B62] whitespace-nowrap">
                          {formatCurrency(rec.totalCost)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-medium text-[#2F2924] whitespace-nowrap">
                          {formatCurrency(rec.sellingPrice)}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <span className="font-bold text-[#6F8F5F]">
                            +{formatCurrency(rec.profit)}
                          </span>
                          <span className="text-[10px] text-[#766B62] block">
                            ({rec.profitMarginPercent}%)
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                          {isCompleted ? (
                            <Badge variant="success" size="sm">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Completed</span>
                            </Badge>
                          ) : (
                            <Badge variant="muted" size="sm">
                              <XCircle className="w-3 h-3 text-[#C04838]" />
                              <span>Cancelled</span>
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          {isCompleted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBatch(rec._id, rec.recipeName)}
                              className="text-xs h-7 px-2 text-[#C04838] hover:bg-[#FEF4F2] border-[#EADBCE]"
                              title="Cancel batch & restore stock"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              <span>Cancel & Restore</span>
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
