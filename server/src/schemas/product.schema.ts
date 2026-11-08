import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string({ required_error: 'SKU is required' })
      .trim()
      .min(2, 'SKU must be at least 2 characters')
      .max(50, 'SKU cannot exceed 50 characters')
      .transform((val) => val.toUpperCase()),
    name: z.string({ required_error: 'Product name is required' })
      .trim()
      .min(2, 'Product name must be at least 2 characters')
      .max(255, 'Product name cannot exceed 255 characters'),
    description: z.string().trim().optional().default(''),
    category: z.string().trim().min(1).default('General'),
    price: z.coerce.number({ required_error: 'Price is required' })
      .min(0, 'Price must be a positive number'),
    stock: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
    image_url: z.string().trim().url('Invalid image URL format').optional().or(z.literal('')),
  }),
});

export const getProductsQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional().default(''),
    category: z.string().trim().optional().default(''),
    sortBy: z.enum(['created_at', 'price', 'name', 'stock']).optional().default('created_at'),
    order: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('DESC').transform((val) => val.toUpperCase() as 'ASC' | 'DESC'),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type GetProductsQueryInput = z.infer<typeof getProductsQuerySchema>['query'];

