import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, LucideIcon } from 'lucide-react';
import { Product } from '../types/product.ts';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=60';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(product.price));

  const getStockStatus = (stock: number): { label: string; color: string; icon: LucideIcon } => {
    if (stock > 10) return { label: `${stock} in stock`, color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 };
    if (stock > 0) return { label: `Only ${stock} left`, color: 'text-amber-600 bg-amber-50', icon: AlertTriangle };
    return { label: 'Out of stock', color: 'text-rose-600 bg-rose-50', icon: XCircle };
  };

  const stockStatus = getStockStatus(product.stock);
  const StatusIcon = stockStatus.icon;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col">
      {/* Image container */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <img
          src={product.image_url || FALLBACK_IMAGE}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-md text-[11px] font-mono font-bold text-slate-700 shadow-sm">
            {product.sku}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-blue-600/90 backdrop-blur-sm rounded-full text-[11px] font-semibold text-white shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1.5 group-hover:text-blue-600 transition-colors" title={product.name}>
          {product.name}
        </h3>
        
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
          {product.description || 'No detailed specifications provided for this product.'}
        </p>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Price</span>
            <span className="text-lg font-extrabold text-slate-900">{formattedPrice}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{stockStatus.label}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

