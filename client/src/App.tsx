import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { StatsCards } from './components/StatsCards.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { StockFilter } from './components/StockFilter.tsx';
import { Pagination } from './components/Pagination.tsx';
import { ProductTable } from './components/ProductTable.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { AddProductModal } from './components/AddProductModal.tsx';
import { EditProductModal } from './components/EditProductModal.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { Toast } from './components/Toast.tsx';
import { api } from './services/api.ts';
import { Product, HealthResponse, CreateProductDTO, ToastMessage, StockStatus, PaginationMeta, InventoryStats } from './types/product.ts';
import { Loader2, PackageSearch, RefreshCw, LayoutList, LayoutGrid, Plus } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filter & Pagination States
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockStatus, setStockStatus] = useState<StockStatus>('all');
  const [sortBy, setSortBy] = useState<string>('created_at-DESC');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Modal & Toast States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Check health
  const checkHealth = useCallback(async () => {
    try {
      const data = await api.checkHealth();
      setHealth(data);
    } catch {
      setHealth({ status: 'DOWN', cloudPlatform: 'Disconnected' });
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.warn('Could not load categories:', err);
    }
  }, []);

  // Fetch inventory stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      console.warn('Could not load inventory stats:', err);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [col, dir] = sortBy.split('-');
      const res = await api.getProducts({
        search: debouncedSearch,
        category: selectedCategory,
        stockStatus,
        sortBy: col,
        order: dir,
        page,
        limit,
      });
      if (res.success) {
        setProducts(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve products');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, stockStatus, sortBy, page, limit]);

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchCategories();
    fetchStats();
  }, [checkHealth, fetchCategories, fetchStats]);

  // Reload products on filter changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add product handler
  const handleAddProduct = async (productData: CreateProductDTO) => {
    const res = await api.createProduct(productData);
    if (res.success) {
      showToast(`Product "${productData.name}" created successfully!`, 'success');
      await fetchProducts();
      await fetchCategories();
      await fetchStats();
      await checkHealth();
    }
  };

  // Update product handler
  const handleUpdateProduct = async (id: number, productData: Partial<CreateProductDTO>) => {
    const res = await api.updateProduct(id, productData);
    if (res.success) {
      showToast(`Product "${productData.name || editingProduct?.name}" updated successfully!`, 'success');
      await fetchProducts();
      await fetchCategories();
      await fetchStats();
      await checkHealth();
    }
  };

  // Delete product handler
  const handleDeleteProduct = async (id: number) => {
    const res = await api.deleteProduct(id);
    if (res.success) {
      showToast(`Product "${deletingProduct?.name}" deleted successfully!`, 'success');
      await fetchProducts();
      await fetchCategories();
      await fetchStats();
      await checkHealth();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar health={health} onOpenAddModal={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Product Inventory
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage catalog items, monitor real-time stock levels, and update product pricing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-slate-200/70 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <LayoutList className="w-4 h-4" />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Grid</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-500/25 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Stats KPI Overview Cards */}
        <StatsCards
          stats={stats}
          selectedStatus={stockStatus}
          onFilterStatus={(st) => {
            setStockStatus(st);
            setPage(1);
          }}
        />

        {/* Toolbar (Search, Filter, Stock) */}
        <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <SearchBar
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
            }}
            sortBy={sortBy}
            onSortChange={(val) => {
              setSortBy(val);
              setPage(1);
            }}
          />

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setPage(1);
            }}
          />

          <StockFilter
            selectedStatus={stockStatus}
            onSelectStatus={(st) => {
              setStockStatus(st);
              setPage(1);
            }}
          />
        </section>

        {/* Content Section */}
        <section>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-500">Retrieving catalog from Railway backend...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 bg-rose-50/50 rounded-2xl border border-rose-200 text-center px-4">
              <p className="text-sm font-bold text-rose-700 mb-1">Failed to fetch catalog</p>
              <p className="text-xs text-rose-500 mb-4">{error}</p>
              <button
                onClick={fetchProducts}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <PackageSearch className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                We couldn't find any products matching your search criteria. Try adjusting your query, category, or stock filters.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                  setStockStatus('all');
                  setPage(1);
                }}
                className="px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {viewMode === 'table' ? (
                <ProductTable
                  products={products}
                  onEdit={(prod) => setEditingProduct(prod)}
                  onDelete={(prod) => setDeletingProduct(prod)}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id || product.sku}
                      product={product}
                      onEdit={(prod) => setEditingProduct(prod)}
                      onDelete={(prod) => setDeletingProduct(prod)}
                    />
                  ))}
                </div>
              )}

              {pagination && (
                <Pagination
                  pagination={pagination}
                  onPageChange={(newPage) => {
                    setPage(newPage);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                  onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                />
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">CatalogHub &bull; Product & Inventory Management Platform</p>
          <p>Frontend: Cloudflare Pages &bull; Backend: Railway Node.js &bull; Database: Railway MySQL</p>
        </div>
      </footer>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProduct}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={!!editingProduct}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSubmit={handleUpdateProduct}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
      />

      {/* Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

