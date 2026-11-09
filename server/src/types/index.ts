export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  price: number | string;
  stock: number;
  image_url: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateProductDTO {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  stock?: number;
  image_url?: string;
}

export interface ProductFilterParams {
  search?: string;
  category?: string;
  stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  sortBy: string;
  order: 'ASC' | 'DESC';
  page: number;
  limit: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HealthResponse {
  status: 'UP' | 'DEGRADED';
  uptimeSeconds: number;
  database: {
    status: 'CONNECTED' | 'DISCONNECTED';
    latencyMs: number;
    totalProducts: number;
  };
  cloudPlatform: string;
}

