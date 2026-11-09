import React from 'react';
import { Package, Plus } from 'lucide-react';
import { HealthResponse } from '../types/product.ts';

interface NavbarProps {
  health: HealthResponse | null;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ health, onOpenAddModal }) => {
  const isHealthy = health?.status === 'UP';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">CatalogHub</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                v1.1.0 &bull; Cloud Native
              </span>
            </div>
            <p className="text-xs text-slate-500">NodeJS TS + MySQL + Cloudflare Pages + Railway</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Health Indicator Badge */}
          <div 
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              isHealthy 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
            title={health ? `Platform: ${health.cloudPlatform} | DB: ${health.database?.status}` : 'Connecting...'}
          >
            <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span>
              {isHealthy 
                ? `Railway Live (${health.database?.latencyMs ?? 0}ms)` 
                : 'Connecting to Cloud...'}
            </span>
          </div>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm shadow-blue-500/25 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>
    </header>
  );
};

