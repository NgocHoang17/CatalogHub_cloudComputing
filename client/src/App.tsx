import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { AddProductModal } from './components/AddProductModal.tsx';
import { Toast } from './components/Toast.tsx';
import { api } from './services/api.ts';
import { Product, HealthResponse, CreateProductDTO, ToastMessage } from './types/product.ts';
import { Loader2, PackageSearch, RefreshCw } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('created_at-DESC');

  // Modal & Toast States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [col, dir] = sortBy.split('-');
      const res = await api.getProducts({
        search: debouncedSearch,
        category: selectedCategory,
        sortBy: col,
        order: dir,
      });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve products');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, sortBy]);

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchCategories();
  }, [checkHealth, fetchCategories]);

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
      await checkHealth();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar health={health} onOpenAddModal={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
              TypeScript &bull; Cloud Computing Project
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Product Inventory & Cloud Catalog
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Decoupled cloud architecture featuring Cloudflare Pages (Frontend Edge CDN), 
              NodeJS TypeScript Express (Railway PaaS), and MySQL Managed Database connected via Railway Private Networking.
            </p>
          </div>
        </section>

        {/* Toolbar (Search & Sort) */}
        <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
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
                We couldn't find any products matching your search criteria. Try adjusting your query or category filters.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id || product.sku} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">CatalogHub &bull; Cloud Computing Final Project (TypeScript Edition)</p>
          <p>Frontend: Cloudflare Pages &bull; Backend: Railway NodeJS Container &bull; DB: Railway MySQL Private Mesh</p>
        </div>
      </footer>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProduct}
      />

      {/* Toast Alert */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

