import React from 'react';
import { Product } from '../types/product.ts';
import { Edit2, Trash2, ImageOff, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  const formatPrice = (val: number | string) => {
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const getStockBadge = (stock: number) => {
    if (stock > 10) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>In Stock ({stock})</span>
        </span>
      );
    }
    if (stock > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Low Stock ({stock})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3 h-3 text-rose-600" />
        <span>Out of Stock</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-4">Product</th>
              <th scope="col" className="px-4 py-4">SKU</th>
              <th scope="col" className="px-4 py-4">Category</th>
              <th scope="col" className="px-4 py-4">Price</th>
              <th scope="col" className="px-4 py-4">Stock Status</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr
                key={product.id || product.sku}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                {/* Product Image & Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <ImageOff className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 max-w-xs sm:max-w-sm">
                      <div className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-xs text-slate-400 truncate mt-0.5">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* SKU */}
                <td className="px-4 py-4 font-mono text-xs font-semibold text-slate-700">
                  {product.sku}
                </td>

                {/* Category */}
                <td className="px-4 py-4">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {product.category || 'General'}
                  </span>
                </td>

                {/* Price */}
                <td className="px-4 py-4 font-bold text-slate-900 whitespace-nowrap">
                  {formatPrice(product.price)}
                </td>

                {/* Stock Status */}
                <td className="px-4 py-4 whitespace-nowrap">
                  {getStockBadge(product.stock)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

