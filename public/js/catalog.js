(() => {
  const form = document.getElementById('catalog-form');
  const results = document.getElementById('catalog-results');
  const status = document.getElementById('catalog-status');
  const pagination = document.getElementById('pagination');
  let controller;
  function element(tag, className, text) {
    const node = document.createElement(tag); if (className) node.className = className;
    if (text !== undefined) node.textContent = text; return node;
  }
  const slugs = new Set(['laptops','smartphones','monitors','keyboards','mice','headphones','storage','accessories']);
  function card(product) {
    const article = element('article', 'product-card');
    const visual = element('a', 'product-visual'); visual.href = `/products/${product.id}`; visual.tabIndex = -1; visual.setAttribute('aria-hidden','true');
    const img = document.createElement('img'); img.alt = product.name; img.loading = 'lazy'; img.width = 320; img.height = 220;
    img.dataset.fallback = `/assets/products/${slugs.has(product.category.slug) ? product.category.slug : 'accessories'}.svg`;
    img.src = product.imageUrl || img.dataset.fallback; visual.append(img);
    const content = element('div','product-content'), meta = element('div','card-meta');
    meta.append(element('span','chip',product.category.name),element('span','sku',product.sku));
    const heading = element('h3'), name = element('a',null,product.name); name.href = visual.href; heading.append(name);
    const price = element('p','product-price',new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(Number(product.price)));
    const link = element('a','detail-link','View details'); link.href = visual.href; const arrow = element('span',null,'↗'); arrow.setAttribute('aria-hidden','true'); link.append(arrow);
    content.append(meta,heading,price,link); article.append(visual,content); return article;
  }
  function pageLink(params, page, label, enabled) {
    const node = element(enabled ? 'a' : 'button','button secondary',label);
    if (enabled) { const next = new URLSearchParams(params); next.set('page',page); node.href = `/?${next}`; }
    else node.disabled = true;
    return node;
  }
  function empty(title, message, retry) {
    const state = element('div','empty-state'); state.append(element('span','state-icon',retry ? '!' : '⌕'),element('h2',null,title),element('p',null,message));
    if (retry) { const button = element('button','button secondary','Retry'); button.addEventListener('click',() => load(new URLSearchParams(location.search),false)); state.append(button); }
    else { const reset = element('a','button secondary','Explore all products'); reset.href = '/'; state.append(reset); }
    return state;
  }
  async function load(params, push = true) {
    controller?.abort(); controller = new AbortController(); const current = controller;
    if (push) history.pushState(null,'',`/?${params}`);
    results.setAttribute('aria-busy','true'); const skeleton = element('div','product-grid');
    for (let i=0;i<4;i++) skeleton.append(element('div','skeleton'));
    results.replaceChildren(skeleton); status.textContent = 'Loading products…'; pagination.replaceChildren();
    try {
      const response = await fetch(`/api/v1/products?${params}`,{signal:current.signal});
      const json = await response.json();
      if (!response.ok) {
        const error = new Error(json.error?.message || 'Please try again.');
        error.status = response.status; error.details = json.error?.details; throw error;
      }
      if (current !== controller) return;
      const { data, meta } = json;
      const first = data.length ? (meta.page-1)*meta.limit+1 : 0;
      status.textContent = `Showing ${first}–${data.length ? first+data.length-1 : 0} of ${meta.total} products`;
      if (data.length) { const grid = element('div','product-grid'); data.forEach(product => grid.append(card(product))); results.replaceChildren(grid); bindImageFallback(results); }
      else results.replaceChildren(empty(meta.total ? 'No products on this page' : params.get('q') || params.get('category') || params.get('minPrice') || params.get('maxPrice') ? 'No matching products' : 'Your next discovery is on its way','Try a different search or explore the full collection.'));
      if (meta.totalPages) pagination.append(pageLink(params,meta.page-1,'← Previous',meta.hasPrevPage),element('span',null,`Page ${meta.page} of ${meta.totalPages}`),pageLink(params,meta.page+1,'Next →',meta.hasNextPage));
    } catch (error) {
      if (error.name === 'AbortError' || current !== controller) return;
      status.textContent = error.status === 400 ? 'Invalid filters' : 'Products could not be loaded';
      results.replaceChildren(empty(error.status === 400 ? 'Check your filters' : 'We couldn’t load the collection',error.message + ' ' + (error.details || []).map(item => item.message).join(' '),error.status !== 400));
    } finally { if (current === controller) results.setAttribute('aria-busy','false'); }
  }
  form.addEventListener('submit',event => { event.preventDefault(); const params = new URLSearchParams(new FormData(form)); for (const [key,value] of [...params]) if (!value) params.delete(key); params.set('page','1'); load(params); });
  form.querySelectorAll('select').forEach(select => select.addEventListener('change',() => form.requestSubmit()));
  pagination.addEventListener('click',event => { const link = event.target.closest('a'); if (!link || event.ctrlKey || event.metaKey) return; event.preventDefault(); load(new URL(link.href).searchParams); });
  addEventListener('popstate',() => {
    const params = new URLSearchParams(location.search);
    for (const input of form.elements) if (input.name) input.value = params.get(input.name) ?? ({sort:'newest',limit:'12'}[input.name] || '');
    load(params,false);
  });
})();
