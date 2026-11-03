const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const request = require('supertest');
const mysql = require('mysql2/promise');
require('dotenv').config({quiet:true,path:process.env.DOTENV_CONFIG_PATH || '.env'});
const { createPool } = require('../src/config/database');
const { createApp } = require('../src/app');

test('MySQL integration: real schema, seed, API and persisted products',async t=>{
  const keys=['TEST_DB_HOST','TEST_DB_USER','TEST_DB_PASSWORD','TEST_DB_NAME'];
  if(keys.some(key=>!process.env[key])) throw new Error('Integration requires explicit TEST_DB_HOST/USER/PASSWORD/NAME. Nothing was tested.');
  const name=process.env.TEST_DB_NAME;
  assert.match(name,/_test$/, 'Refusing a database name that does not end with _test');
  assert.notEqual(name,process.env.DB_NAME,'Test DB must differ from application DB');
  const db={host:process.env.TEST_DB_HOST,port:Number(process.env.TEST_DB_PORT||3306),user:process.env.TEST_DB_USER,password:process.env.TEST_DB_PASSWORD,database:name,connectionLimit:4};
  const admin=await mysql.createConnection({...db,connectionLimit:undefined,multipleStatements:true});
  const pool=createPool(db);
  t.after(async()=>{await pool.end();await admin.end();});
  const schema=await fs.readFile(path.join(__dirname,'../database/schema.sql'),'utf8');
  const seed=await fs.readFile(path.join(__dirname,'../database/seed.sql'),'utf8');
  await admin.query(schema); await admin.query(seed);
  const app=createApp({pool,config:{nodeEnv:'test',writeEnabled:true}});
  const api=request(app);
  let createdId;
  await t.test('seed reruns do not duplicate 8 categories or 24 sample products',async()=>{
    const [[before]]=await admin.query('SELECT (SELECT COUNT(*) FROM products) products, (SELECT COUNT(*) FROM categories) categories');
    await admin.query(seed);
    const [[after]]=await admin.query('SELECT (SELECT COUNT(*) FROM products) products, (SELECT COUNT(*) FROM categories) categories');
    assert.deepEqual(after,before); assert.equal(Number(after.categories),8); assert.ok(Number(after.products)>=24);
  });
  const categories=(await api.get('/api/v1/categories').expect(200)).body.data;
  const category=categories.find(item=>item.slug==='keyboards');
  await t.test('health and readiness connect',async()=>{await api.get('/health').expect(200);await api.get('/ready').expect(200);});
  await t.test('categories sorted by name and correct contract',()=>{
    assert.equal(categories.length,8); assert.deepEqual(categories.map(item=>item.name),categories.map(item=>item.name).sort());
    assert.deepEqual(Object.keys(category).sort(),['id','name','slug']);
  });
  await t.test('search by name, description, SKU, no results and literal wildcards',async()=>{
    const lower=(await api.get('/api/v1/products?q=logitech').expect(200)).body;
    const upper=(await api.get('/api/v1/products?q=LOGITECH').expect(200)).body;
    assert.deepEqual(lower,upper); assert.ok(lower.meta.total>=2);
    const sku=(await api.get('/api/v1/products?q=KEY-001').expect(200)).body; assert.equal(sku.data[0].sku,'KEY-001');
    assert.ok((await api.get('/api/v1/products?q=illumination')).body.meta.total>=1);
    for(const q of ['zzzz-unfindable-987654', "' OR 1=1 --"]) {
      const response=(await api.get('/api/v1/products').query({q}).expect(200)).body;
      assert.equal(response.meta.total,0);assert.equal(response.meta.totalPages,0);assert.deepEqual(response.data,[]);
    }
    for(const q of ['%', '_', '\\']) {
      const response=(await api.get('/api/v1/products').query({q}).expect(200)).body;
      // Prior test runs intentionally retain products with these literal characters.
      assert.ok(response.data.every(item=>[item.name,item.sku,item.description||''].some(value=>value.includes(q))));
    }
  });
  await t.test('filters, decimal string contract, sorting, pagination and unknown categories',async()=>{
    const filtered=(await api.get('/api/v1/products?category=keyboards&minPrice=0&maxPrice=3000000&sort=price_asc').expect(200)).body;
    assert.ok(filtered.data.length); assert.ok(filtered.data.every(item=>item.category.slug==='keyboards'&&typeof item.price==='string'));
    assert.deepEqual(filtered.data.map(item=>Number(item.price)),filtered.data.map(item=>Number(item.price)).sort((a,b)=>a-b));
    for(const sort of ['newest','price_desc','name_asc']) await api.get('/api/v1/products').query({sort}).expect(200);
    const first=(await api.get('/api/v1/products?limit=12&page=1')).body;
    const second=(await api.get('/api/v1/products?limit=12&page=2')).body;
    assert.equal(first.data.length,12); assert.equal(second.data.length,12);
    assert.ok(!second.data.some(item=>first.data.some(other=>other.id===item.id)));
    assert.equal(second.meta.hasPrevPage,true);
    const beyond=(await api.get('/api/v1/products?page=999')).body; assert.deepEqual(beyond.data,[]); assert.ok(beyond.meta.total>=24);
    assert.equal((await api.get('/api/v1/products?category=unknown').expect(400)).body.error.code,'CATEGORY_NOT_FOUND');
  });
  const sku=`QA-${Date.now()}`;
  const body={name:'<script>alert("xss")</script> Keyboard',sku,categoryId:category.id,price:'1999999.99',description:'<img src=x onerror=alert(1)> 50%_\\!',imageUrl:'https://invalid.example.test/broken.png'};
  await t.test('valid POST persists exactly, returns Location and a complete product',async()=>{
    const response=await api.post('/api/v1/products').send(body).expect(201);
    createdId=response.body.data.id;
    assert.equal(response.headers.location,`/api/v1/products/${createdId}`);
    const product=response.body.data; assert.equal(product.price,'1999999.99');assert.equal(product.sku,sku);assert.equal(product.category.slug,'keyboards');assert.match(product.createdAt,/Z$/);
    assert.deepEqual((await api.get(`/api/v1/products/${createdId}`).expect(200)).body.data,product);
    const [[row]]=await admin.execute('SELECT price, sku FROM products WHERE id = ?',[createdId]); assert.equal(row.price,'1999999.99'); assert.equal(row.sku,sku);
  });
  await t.test('duplicates including concurrent requests cannot insert two SKUs',async()=>{
    assert.equal((await api.post('/api/v1/products').send(body).expect(409)).body.error.code,'SKU_ALREADY_EXISTS');
    const race={...body,sku:`RACE-${Date.now()}`};
    const responses=await Promise.all([api.post('/api/v1/products').send(race),api.post('/api/v1/products').send(race)]);
    assert.deepEqual(responses.map(response=>response.status).sort(),[201,409]);
  });
  await t.test('invalid category or fields never insert a product',async()=>{
    const [[before]]=await admin.query('SELECT COUNT(*) count FROM products');
    for(const invalid of [{},{...body,categoryId:999999},{...body,price:'-1'},{...body,sku:'invalid_'},{...body,price:'1e3'}]) await api.post('/api/v1/products').send(invalid).expect(422);
    const [[after]]=await admin.query('SELECT COUNT(*) count FROM products');assert.equal(after.count,before.count);
  });
  await t.test('SQL wildcard characters are escaped even when a matching literal exists',async()=>{
    for(const q of ['50%_\\!','%','_','\\']) {
      const response=await api.get('/api/v1/products').query({q}).expect(200);
      assert.ok(response.body.data.some(item=>item.id===createdId));
      assert.ok(response.body.data.every(item=>item.description?.includes(q)||item.name.includes(q)||item.sku.includes(q)));
    }
  });
  await t.test('server-rendered pages escape HTML and keep URL values',async()=>{
    const detail=await api.get(`/products/${createdId}`).expect(200);
    assert.ok(detail.text.includes('&lt;script&gt;'));assert.ok(!detail.text.includes('<script>alert('));
    const catalog=await api.get('/?q=KEY&category=keyboards&sort=price_asc').expect(200);
    assert.match(catalog.text,/value="KEY"/);assert.match(catalog.text,/value="keyboards" selected/);assert.match(catalog.text,/product-card/);
    await api.get('/products/new').expect(200);await api.get('/?q=nonexistent-zzzzz').expect(200).expect(/No matching products/);
    await api.get('/?minPrice=5&maxPrice=1').expect(400).expect(/Check your filters/);
    await api.get('/products/999999999').expect(404);await api.get('/api/v1/products/999999999').expect(404);
  });
  await t.test('write-disabled mode forbids valid creation and renders disabled form',async()=>{
    const readOnly=request(createApp({pool,config:{nodeEnv:'test',writeEnabled:false}}));
    await readOnly.post('/api/v1/products').send({...body,sku:'NO-WRITE'}).expect(403);
    await readOnly.get('/products/new').expect(200).expect(/<fieldset disabled>/);
  });
  // Deliberately retains QA records in this isolated test DB for inspection.
});
