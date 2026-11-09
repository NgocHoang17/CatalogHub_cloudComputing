import React from 'react';
import { StockStatus } from '../types/product.ts';
import { CheckCircle2, AlertTriangle, XCircle, Layers } from 'lucide-react';

interface StockFilterProps {
  selectedStatus: StockStatus;
  onSelectStatus: (status: StockStatus) => void;
}

export const StockFilter: React.FC<StockFilterProps> = ({
  selectedStatus,
  onSelectStatus,
}) => {
  const options: Array<{
    id: StockStatus;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    activeClass: string;
    badgeDotClass: string;
  }> = [
    {
      id: 'all',
      label: 'All Items',
      icon: Layers,
      activeClass: 'bg-slate-900 text-white shadow-sm',
      badgeDotClass: 'bg-slate-400',
    },
    {
      id: 'in_stock',
      label: 'In Stock (>10)',
      icon: CheckCircle2,
      activeClass: 'bg-emerald-600 text-white shadow-sm shadow-emerald-200',
      badgeDotClass: 'bg-emerald-500',
    },
    {
      id: 'low_stock',
      label: 'Low Stock (1–10)',
      icon: AlertTriangle,
      activeClass: 'bg-amber-600 text-white shadow-sm shadow-amber-200',
      badgeDotClass: 'bg-amber-500',
    },
    {
      id: 'out_of_stock',
      label: 'Out of Stock (0)',
      icon: XCircle,
      activeClass: 'bg-rose-600 text-white shadow-sm shadow-rose-200',
      badgeDotClass: 'bg-rose-500',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
        Stock:
      </span>
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = selectedStatus === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectStatus(opt.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? opt.activeClass
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

