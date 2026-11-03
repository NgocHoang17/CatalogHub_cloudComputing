const { z } = require('zod');
const unicodeLength = (min, max) => value => [...value].length >= min && [...value].length <= max;
const decimal = z.union([z.string(), z.number()]).transform((value, ctx) => {
  const text = typeof value === 'string' ? value.trim() : String(value);
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(text)) {
    ctx.addIssue({ code: 'custom', message: 'Use a price from 0 to 9999999999.99 with at most two decimal places.' });
    return z.NEVER;
  }
  const [whole, fraction = ''] = text.split('.');
  return `${BigInt(whole)}.${fraction.padEnd(2, '0')}`;
});
const id = z.union([z.string().regex(/^[1-9]\d*$/), z.number().int().positive()])
  .transform(Number).refine(Number.isSafeInteger, 'ID must be a safe positive integer.');
const optionalText = max => z.string().trim().refine(unicodeLength(0, max), `Use at most ${max} characters.`)
  .nullable().optional().transform(value => value || null);
const productSchema = z.object({
  name: z.string().trim().refine(unicodeLength(3, 160), 'Product name must contain 3–160 characters.'),
  sku: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,32}$/, 'Use 3–32 letters, numbers or hyphens.'),
  categoryId: id,
  price: decimal,
  description: optionalText(2000),
  imageUrl: optionalText(2048).refine(value => {
    if (!value) return true;
    try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
  }, 'Use a valid HTTP or HTTPS image URL.')
}).strict();
const optionalPrice = z.preprocess(value => value === '' ? undefined : value, decimal.optional());
const querySchema = z.object({
  q: z.string().trim().refine(unicodeLength(0, 100), 'Search must contain at most 100 characters.').default(''),
  category: z.string().regex(/^[a-z0-9-]{1,80}$/).optional().or(z.literal('')),
  minPrice: optionalPrice, maxPrice: optionalPrice,
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).default('newest'),
  page: z.string().regex(/^[1-9]\d*$/).transform(Number).refine(value => Number.isSafeInteger(value) && value <= Math.floor(Number.MAX_SAFE_INTEGER / 24)).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(value => value >= 1 && value <= 24).default(12)
}).strict().refine(value => value.minPrice === undefined || value.maxPrice === undefined || cents(value.minPrice) <= cents(value.maxPrice), {
  path: ['maxPrice'], message: 'Max price must be greater than or equal to min price.'
});
function cents(value) { return BigInt(value.replace('.', '')); }
module.exports = { productSchema, querySchema, idSchema: id, decimal };
