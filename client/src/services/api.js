const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return '';
};

export const API_BASE_URL = getBaseUrl();

async function request(endpoint, options = {}) {
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
      message = data.errors.map((e) => `${e.field}: ${e.message}`).join(', ');
    }
    throw new Error(message);
  }

  return data;
}

export const api = {
  checkHealth: () => request('/api/health'),
  getProducts: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    return request(`/api/products?${qs.toString()}`);
  },
  createProduct: (data) => request('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getCategories: () => request('/api/products/categories'),
};

