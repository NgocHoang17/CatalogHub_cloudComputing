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
    stockStatus: z.enum(['all', 'in_stock', 'low_stock', 'out_of_stock']).optional().default('all'),
    sortBy: z.enum(['created_at', 'price', 'name', 'stock']).optional().default('created_at'),
    order: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('DESC').transform((val) => val.toUpperCase() as 'ASC' | 'DESC'),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  }),
});

export const productIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Product ID must be a positive integer'),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Product ID must be a positive integer'),
  }),
  body: z.object({
    name: z.string().trim().min(2, 'Product name must be at least 2 characters').max(255).optional(),
    description: z.string().trim().optional(),
    category: z.string().trim().min(1).optional(),
    price: z.coerce.number().min(0, 'Price must be a positive number').optional(),
    stock: z.coerce.number().int().min(0, 'Stock cannot be negative').optional(),
    image_url: z.string().trim().url('Invalid image URL format').optional().or(z.literal('')),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type GetProductsQueryInput = z.infer<typeof getProductsQuerySchema>['query'];

