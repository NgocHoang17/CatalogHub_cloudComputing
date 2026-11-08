import { Product, CreateProductDTO, ApiResponse, HealthResponse } from '../types/product.ts';

const getBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return (import.meta.env.VITE_API_BASE_URL as string).replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return '';
};

export const API_BASE_URL = getBaseUrl();

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message = data.message || `Request failed with status ${response.status}`;
    if (data.errors && Array.isArray(data.errors)) {
      message = data.errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(', ');
    }
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  checkHealth: (): Promise<HealthResponse> => request<HealthResponse>('/api/health'),
  
  getProducts: (params: {
    search?: string;
    category?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<Product[]>> => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    return request<ApiResponse<Product[]>>(`/api/products?${qs.toString()}`);
  },

  createProduct: (data: CreateProductDTO): Promise<ApiResponse<Product>> =>
    request<ApiResponse<Product>>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCategories: (): Promise<ApiResponse<string[]>> =>
    request<ApiResponse<string[]>>('/api/products/categories'),
};

