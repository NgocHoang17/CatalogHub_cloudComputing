const { test } = require('node:test');
const assert = require('node:assert/strict');
const { productSchema, querySchema, idSchema } = require('../src/validators/product.schema');
const { escapeLike } = require('../src/repositories/product.repository');
const { loadEnv } = require('../src/config/env');
const valid = { name:'  Keyboard K2  ', sku:' kb-001 ', categoryId:1, price:'1290000.1' };
test('normalizes strings, optional fields and decimal money exactly', () => {
  assert.deepEqual(productSchema.parse(valid), { name:'Keyboard K2', sku:'KB-001', categoryId:1, price:'1290000.10', description:null, imageUrl:null });
  assert.equal(productSchema.parse({...valid,price:'9999999999.99'}).price,'9999999999.99');
  assert.equal(productSchema.parse({...valid,price:0}).price,'0.00');
});
for (const price of [-1,Infinity,NaN,'1e3','1,000','1.001','10000000000','',null,true]) {
  test(`rejects invalid price ${String(price)}`, () => assert.equal(productSchema.safeParse({...valid,price}).success,false));
}
test('rejects required, invalid SKU, category, URL and unknown fields', () => {
  for (const body of [{}, {...valid,name:'  '},{...valid,sku:'a_b'}, {...valid,categoryId:0}, {...valid,categoryId:true}, {...valid,imageUrl:'javascript:alert(1)'}, {...valid,imageUrl:'file:///etc/passwd'}, {...valid,description:'x'.repeat(2001)}, {...valid,admin:true}]) assert.equal(productSchema.safeParse(body).success,false);
  assert.equal(productSchema.parse({...valid,imageUrl:'https://example.com/image.jpg'}).imageUrl,'https://example.com/image.jpg');
});
test('counts Unicode code points and trims descriptions', () => {
  assert.equal(productSchema.safeParse({...valid,name:'😀'.repeat(160)}).success,true);
  assert.equal(productSchema.safeParse({...valid,name:'😀'.repeat(161)}).success,false);
  assert.equal(productSchema.parse({...valid,description:'   '}).description,null);
});
test('query defaults, decimals, sorting and pagination', () => {
  assert.deepEqual(querySchema.parse({}),{q:'',sort:'newest',page:1,limit:12});
  const query = querySchema.parse({minPrice:'0',maxPrice:'999.99',page:'2',limit:'24',q:' laptop '});
  assert.equal(query.q,'laptop'); assert.equal(query.minPrice,'0.00'); assert.equal(query.page,2);
  for (const input of [{page:'0'},{page:'1.1'},{limit:'25'},{limit:'0'},{page:'99999999999999999999'},{sort:'price; DROP TABLE products'},{minPrice:'2',maxPrice:'1'},{q:['one','two']},{q:'x'.repeat(101)},{category:'bad slug'},{unknown:'x'}]) assert.equal(querySchema.safeParse(input).success,false);
});
test('IDs accept only safe positive integers', () => {
  assert.equal(idSchema.parse('123'),123);
  for (const value of ['-1','0','1.5','1e2','abc','9007199254740992',true]) assert.equal(idSchema.safeParse(value).success,false);
});
test('LIKE metacharacters and escape character are literals', () => {
  assert.equal(escapeLike('50%_\\!'), '50!%!_!\\!!');
});
test('environment validates without disclosing values; production defaults to read-only', () => {
  const env = { DB_HOST:'localhost',DB_USER:'app',DB_PASSWORD:'secret-value',DB_NAME:'catalog',NODE_ENV:'production' };
  assert.equal(loadEnv(env).writeEnabled,false);
  assert.equal(loadEnv(env).host,'0.0.0.0');
  assert.throws(()=>loadEnv({...env,DB_PASSWORD:''}),/DB_PASSWORD/);
  assert.throws(()=>loadEnv({...env,PORT:'bad'}),/Invalid environment variable: PORT/);
  assert.throws(()=>loadEnv({...env,ENABLE_PRODUCT_WRITE:'yes'}),/true or false/);
});
