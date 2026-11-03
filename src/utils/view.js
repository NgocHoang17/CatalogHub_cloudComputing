const assets = new Set(['laptops', 'smartphones', 'monitors', 'keyboards', 'mice', 'headphones', 'accessories', 'storage']);
module.exports = {
  money: value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value)),
  fallback: slug => `/assets/products/${assets.has(slug) ? slug : 'accessories'}.svg`,
  date: value => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value))
};
