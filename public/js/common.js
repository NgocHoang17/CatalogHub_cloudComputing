function bindImageFallback(root = document) {
  root.querySelectorAll('img[data-fallback]').forEach(img => {
    const fallback = () => {
      if (!img.dataset.fallback) return;
      const src = img.dataset.fallback;
      delete img.dataset.fallback;
      img.src = src;
    };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && !img.naturalWidth) fallback();
  });
}
bindImageFallback();
document.getElementById('retry-page')?.addEventListener('click', () => location.reload());
