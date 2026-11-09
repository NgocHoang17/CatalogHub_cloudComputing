import React from 'react';
import { InventoryStats, StockStatus } from '../types/product.ts';
import { Package, DollarSign, AlertTriangle, XCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: InventoryStats | null;
  selectedStatus: StockStatus;
  onFilterStatus: (status: StockStatus) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  selectedStatus,
  onFilterStatus,
}) => {
  if (!stats) return null;

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(stats.totalValue);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Products */}
      <div
        onClick={() => onFilterStatus('all')}
        className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer ${
          selectedStatus === 'all'
            ? 'border-blue-500 shadow-sm ring-1 ring-blue-500'
            : 'border-slate-200 hover:border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Products
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {stats.totalProducts}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Active catalog SKUs</p>
        </div>
      </div>

      {/* Inventory Value */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Inventory Value
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formattedValue}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Asset valuation</p>
        </div>
      </div>

      {/* Low Stock Warning */}
      <div
        onClick={() => onFilterStatus(selectedStatus === 'low_stock' ? 'all' : 'low_stock')}
        className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer ${
          selectedStatus === 'low_stock'
            ? 'border-amber-500 shadow-sm ring-1 ring-amber-500'
            : 'border-slate-200 hover:border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Low Stock
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-amber-600 tracking-tight">
            {stats.lowStock}
          </span>
          <span className="text-xs text-amber-700 bg-amber-50 font-medium px-2 py-0.5 rounded-full border border-amber-200/60">
            1–10 left
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">Click to view items</p>
      </div>

      {/* Out of Stock Warning */}
      <div
        onClick={() => onFilterStatus(selectedStatus === 'out_of_stock' ? 'all' : 'out_of_stock')}
        className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer ${
          selectedStatus === 'out_of_stock'
            ? 'border-rose-500 shadow-sm ring-1 ring-rose-500'
            : 'border-slate-200 hover:border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Out of Stock
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-rose-600 tracking-tight">
            {stats.outOfStock}
          </span>
          <span className="text-xs text-rose-700 bg-rose-50 font-medium px-2 py-0.5 rounded-full border border-rose-200/60">
            0 units
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">Click to view items</p>
      </div>
    </div>
  );
};

