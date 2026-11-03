(() => {
  const form = document.getElementById('product-form');
  const submit = document.getElementById('submit-product');
  const status = document.getElementById('form-status');
  let pending = false;
  const messages = { name:'Product name must contain 3–160 characters.',sku:'Use 3–32 letters, numbers or hyphens.',categoryId:'Select a category.',price:'Enter a price from 0 to 9999999999.99 with at most two decimals.',imageUrl:'Use a valid HTTP or HTTPS URL.',description:'Use at most 2000 characters.' };
  function fieldError(field,message) {
    const input = form.elements.namedItem(field), error = document.getElementById(`${field}-error`);
    if (input && error) { input.setAttribute('aria-invalid','true'); error.textContent = message; }
  }
  form.addEventListener('submit',async event => {
    event.preventDefault(); if (pending || submit.disabled || form.querySelector('fieldset').disabled) return;
    status.replaceChildren(); form.querySelectorAll('.field-error').forEach(node => node.textContent = '');
    form.querySelectorAll('[aria-invalid]').forEach(node => node.removeAttribute('aria-invalid'));
    const body = Object.fromEntries(new FormData(form));
    body.name = body.name.trim(); body.sku = body.sku.trim().toUpperCase(); body.price = body.price.trim();
    body.description = body.description.trim() || null; body.imageUrl = body.imageUrl.trim() || null;
    const errors = [];
    if ([...body.name].length < 3 || [...body.name].length > 160) errors.push('name');
    if (!/^[A-Z0-9-]{3,32}$/.test(body.sku)) errors.push('sku');
    if (!body.categoryId) errors.push('categoryId');
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(body.price)) errors.push('price');
    if (body.description && [...body.description].length > 2000) errors.push('description');
    if (body.imageUrl) { try { if (!['http:','https:'].includes(new URL(body.imageUrl).protocol) || body.imageUrl.length > 2048) errors.push('imageUrl'); } catch { errors.push('imageUrl'); } }
    errors.forEach(field => fieldError(field,messages[field]));
    if (errors.length) { form.elements.namedItem(errors[0]).focus(); return; }
    pending = true; submit.disabled = true; submit.textContent = 'Saving…';
    try {
      const response = await fetch('/api/v1/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const json = await response.json();
      if (!response.ok) {
        (json.error?.details || []).forEach(item => fieldError(item.field,item.message));
        throw new Error(json.error?.message || 'Unable to save product.');
      }
      form.hidden = true;
      const panel = document.createElement('div'); panel.className = 'success-panel';
      const heading = document.createElement('h2'); heading.textContent = 'A great addition. Product saved!';
      const text = document.createElement('p'); text.textContent = `${json.data.name} · ${json.data.sku} is now in your catalog.`;
      const view = document.createElement('a'); view.className = 'button'; view.href = `/products/${json.data.id}`; view.textContent = 'View product →';
      const another = document.createElement('button'); another.className = 'button secondary'; another.textContent = 'Add another'; another.addEventListener('click',() => { form.reset(); form.hidden = false; status.replaceChildren(); form.elements.name.focus(); });
      panel.append(heading,text,view,another); status.replaceChildren(panel); status.focus();
    } catch (error) { const notice = document.createElement('p'); notice.className = 'notice error'; notice.textContent = error.message === 'Failed to fetch' ? 'Connection failed. Your product was not confirmed saved. Check the catalog before retrying.' : error.message; status.append(notice); status.focus(); }
    finally { pending = false; submit.disabled = false; submit.textContent = 'Add product ＋'; }
  });
})();
