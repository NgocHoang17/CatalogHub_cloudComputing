export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  price: number | string;
  stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductDTO {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock?: number;
  image_url?: string;
  description?: string;
}

export type StockStatus = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  errors?: Array<{ field: string; message: string }>;
}

export interface HealthResponse {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  uptimeSeconds?: number;
  database?: {
    status: 'CONNECTED' | 'DISCONNECTED';
    latencyMs: number;
    totalProducts: number;
  };
  cloudPlatform: string;
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

