// These tests use a real MySQL pool pointed at a closed local port.
// No fake product/category data and no replacement repository are used.
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');
const { createPool } = require('../src/config/database');
const pool = createPool({host:'127.0.0.1',port:1,user:'unavailable',password:'not-a-real-secret',database:'cataloghub_test',connectionLimit:1});
const config = {nodeEnv:'test',writeEnabled:true};
const app = createApp({pool,config});
after(()=>pool.end());
test('health independent of DB, readiness reports real unreachable database',async()=>{
  assert.deepEqual((await request(app).get('/health').expect(200)).body,{status:'ok'});
  assert.deepEqual((await request(app).get('/ready').expect(503)).body,{status:'not_ready',database:'unavailable'});
});
test('API unknown route is JSON, web unknown route is a friendly HTML page',async()=>{
  assert.equal((await request(app).get('/api/missing').expect(404)).body.error.code,'NOT_FOUND');
  await request(app).get('/missing').expect(404).expect('Content-Type',/html/);
});
test('invalid filters and IDs fail before DB access',async()=>{
  for (const path of ['/api/v1/products?minPrice=2&maxPrice=1','/api/v1/products?limit=25','/api/v1/products?q=a&q=b','/api/v1/products?sort=bad']) assert.equal((await request(app).get(path).expect(400)).body.error.code,'INVALID_QUERY');
  assert.equal((await request(app).get('/api/v1/products/no').expect(400)).body.error.code,'INVALID_ID');
});
test('body validation, media type, malformed JSON and body limit',async()=>{
  const invalid = await request(app).post('/api/v1/products').send({}).expect(422);
  assert.equal(invalid.body.error.code,'VALIDATION_ERROR'); assert.ok(invalid.body.error.details.some(item=>item.field==='name'));
  await request(app).post('/api/v1/products').set('Content-Type','text/plain').send('x').expect(415);
  await request(app).post('/api/v1/products').set('Content-Type','application/json').send('{"price":1e3}').expect(422);
  await request(app).post('/api/v1/products').set('Content-Type','application/json').send('{"pri\\u0063e":1e3}').expect(422);
  assert.equal((await request(app).post('/api/v1/products').set('Content-Type','application/json').send('{').expect(400)).body.error.code,'INVALID_JSON');
  assert.equal((await request(app).post('/api/v1/products').send({text:'a'.repeat(103000)}).expect(413)).body.error.code,'BODY_TOO_LARGE');
});
test('write gate and disabled UI are enforced',async()=>{
  const readOnly = createApp({pool,config:{...config,writeEnabled:false}});
  assert.equal((await request(readOnly).post('/api/v1/products').send({}).expect(403)).body.error.code,'WRITE_DISABLED');
  const page = await request(readOnly).get('/products/new').expect(503);
  assert.match(page.text,/Demo write access is disabled/); assert.match(page.text,/<fieldset disabled>/);
});
test('actual DB connection errors are safely mapped to 503',async()=>{
  for (const path of ['/api/v1/products','/api/v1/categories','/api/v1/products/1']) {
    const response = await request(app).get(path).expect(503);
    assert.equal(response.body.error.code,'DATABASE_UNAVAILABLE');
    assert.doesNotMatch(JSON.stringify(response.body),/SELECT|password|unavailable@|ECONNREFUSED/);
  }
  await request(app).get('/').expect(503).expect(/We couldn’t load this page/);
});
test('security headers, no CORS wildcard, POST rate limit',async()=>{
  const response = await request(app).get('/health');
  assert.match(response.headers['content-security-policy'],/script-src 'self'/);
  assert.equal(response.headers['x-content-type-options'],'nosniff');
  assert.equal(response.headers['access-control-allow-origin'],undefined);
  assert.equal(response.headers['x-powered-by'],undefined);
  const isolated = createApp({pool,config});
  for(let i=0;i<20;i++) await request(isolated).post('/api/v1/products').send({}).expect(422);
  assert.equal((await request(isolated).post('/api/v1/products').send({}).expect(429)).body.error.code,'RATE_LIMITED');
});
