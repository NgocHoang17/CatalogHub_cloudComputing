// Runs against the explicitly configured, isolated TEST_DB_* database only.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
require('dotenv').config({quiet:true,path:process.env.DOTENV_CONFIG_PATH || '.env'});
const { createApp } = require('../src/app');
const { createPool } = require('../src/config/database');
(async()=>{
  let browser,server,pool;
  try {
    for(const key of ['TEST_DB_HOST','TEST_DB_USER','TEST_DB_PASSWORD','TEST_DB_NAME']) if(!process.env[key]) throw new Error(`Missing ${key}`);
    assert.match(process.env.TEST_DB_NAME,/_test$/);assert.notEqual(process.env.TEST_DB_NAME,process.env.DB_NAME);
    pool=createPool({host:process.env.TEST_DB_HOST,port:Number(process.env.TEST_DB_PORT||3306),user:process.env.TEST_DB_USER,password:process.env.TEST_DB_PASSWORD,database:process.env.TEST_DB_NAME,connectionLimit:4});
    await pool.query('SELECT 1');
    server=createApp({pool,config:{nodeEnv:'test',writeEnabled:true}}).listen(0,'127.0.0.1');
    await new Promise(resolve=>server.once('listening',resolve));
    const base=`http://127.0.0.1:${server.address().port}`;
    browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'chrome',headless:true});
    const page=await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
    const screenshots=path.join(__dirname,'../docs/screenshots');await fs.mkdir(screenshots,{recursive:true});
    for(const width of [375,768,1280,1440]) {
      await page.setViewportSize({width,height:960});
      for(const route of ['/','/products/new','/products/1']) {
        await page.goto(base+route);await page.locator('main').waitFor();
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Horizontal overflow at ${width} ${route}`);
      }
      await page.goto(`${base}/?sort=price_desc`);await page.locator('.product-card').first().waitFor();
      if(width===375 || width===1440) {
        await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>{img.loading='eager';return img.decode().catch(()=>{});} )));
        await page.screenshot({path:path.join(screenshots,`catalog-${width}.png`),fullPage:true});
        await page.goto(`${base}/products/new`);
        await page.screenshot({path:path.join(screenshots,`add-product-${width}.png`),fullPage:true});
      }
    }
    console.log('PASS: catalog, add and detail have no horizontal overflow at 375, 768, 1280, 1440 px.');
    await page.goto(base);
    await page.getByLabel('Search products',{exact:true}).fill('Logitech');
    await page.getByRole('button',{name:'Search',exact:true}).click();
    await page.waitForFunction(()=>document.getElementById('catalog-results').getAttribute('aria-busy')==='false');
    assert.match(page.url(),/q=Logitech/);assert.ok(await page.locator('.product-card').count()>=2);
    await page.reload();assert.equal(await page.locator('#q').inputValue(),'Logitech');
    await page.locator('#category').selectOption('mice');
    await page.waitForFunction(()=>document.getElementById('catalog-results').getAttribute('aria-busy')==='false');
    assert.ok(await page.locator('.product-card').count()>=1);
    await page.locator('#minPrice').fill('5000');await page.locator('#maxPrice').fill('1');
    await page.getByRole('button',{name:'Search',exact:true}).click();
    await page.getByRole('heading',{name:'Check your filters'}).waitFor();
    await page.goto(base);await page.locator('#q').fill('zz-no-products-98765');
    await page.getByRole('button',{name:'Search',exact:true}).click();await page.getByRole('heading',{name:'No matching products'}).waitFor();
    await page.goto(base);await page.locator('#pagination').getByRole('link',{name:'Next'}).click();
    await page.waitForFunction(()=>document.getElementById('catalog-results').getAttribute('aria-busy')==='false');
    assert.match(page.url(),/page=2/);
    console.log('PASS: API search, filters, invalid range, empty search, pagination and refresh persistence.');
    // A controlled failed API response exercises retry, without substituting product data.
    await page.route('**/api/v1/products?**',route=>route.abort());
    await page.locator('#q').fill('laptop');await page.getByRole('button',{name:'Search',exact:true}).click();
    await page.getByRole('button',{name:'Retry',exact:true}).waitFor();
    await page.unroute('**/api/v1/products?**');await page.getByRole('button',{name:'Retry',exact:true}).click();
    await page.locator('.product-card').first().waitFor();
    console.log('PASS: network failure and retry.');
    await page.goto(`${base}/products/new`);
    await page.getByRole('button',{name:'Add product',exact:false}).click();
    assert.ok(await page.locator('[aria-invalid="true"]').count()>=4);
    const sku=`UI-${Date.now()}`;
    await page.getByLabel('Product Name').fill('Browser verified keyboard');await page.getByLabel('SKU').fill(sku.toLowerCase());
    await page.getByLabel('Category',{exact:false}).selectOption({label:'Keyboards'});
    await page.getByLabel('Price (VND)').fill('1290000.01');
    await page.getByLabel('Description').fill('Created by a real browser and persisted to MySQL.');
    await page.getByLabel('Image URL').fill('https://invalid.example.test/broken.png');
    let posts=0;page.on('request',req=>{if(req.method()==='POST'&&req.url().endsWith('/api/v1/products')) posts++;});
    await page.getByRole('button',{name:'Add product',exact:false}).dblclick();
    await page.getByRole('heading',{name:'A great addition. Product saved!'}).waitFor();assert.equal(posts,1);
    await page.getByRole('link',{name:'View product'}).click();
    await page.getByRole('heading',{name:'Browser verified keyboard'}).waitFor();await page.reload();
    const img=page.locator('.detail-visual img');await page.waitForFunction(()=>document.querySelector('.detail-visual img')?.getAttribute('src')==='/assets/products/keyboards.svg');
    assert.ok(await img.evaluate(node=>node.complete&&node.naturalWidth>0));
    const response=await page.request.get(`${base}/api/v1/products?q=${sku}`);const json=await response.json();
    assert.equal(json.data[0].sku,sku);assert.equal(json.data[0].price,'1290000.01');
    console.log('PASS: inline validation, real form INSERT, uppercase SKU, exact decimal, double-submit protection, reload and image fallback.');
    assert.deepEqual(errors,[]);console.log('PASS: no uncaught browser JavaScript errors. Four real screenshots saved in docs/screenshots/.');
  } finally {
    if(browser) await browser.close();
    if(server) await new Promise(resolve=>server.close(resolve));
    if(pool) await pool.end();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
