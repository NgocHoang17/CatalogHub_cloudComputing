const { test } = require('node:test');
const assert = require('node:assert/strict');
const { fork, spawnSync } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
test('missing configuration exits nonzero without disclosing credentials',()=>{
  const result=spawnSync(process.execPath,['src/server.js'],{env:{...process.env,DB_HOST:'',DB_USER:'',DB_PASSWORD:'',DB_NAME:''},encoding:'utf8',timeout:10000});
  assert.equal(result.status,1);assert.match(result.stderr,/Missing required environment variables/);
});
test('real server starts without DB and SIGTERM handler closes HTTP and pool',{timeout:15000},async t=>{
  const reservation=net.createServer();await new Promise(resolve=>reservation.listen(0,'127.0.0.1',resolve));
  const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
  const child=fork(path.join(__dirname,'../src/server.js'),[],{
    execArgv:['--require',path.join(__dirname,'fixtures/signal-hook.cjs')],
    env:{...process.env,NODE_ENV:'production',HOST:'0.0.0.0',PORT:String(port),DB_HOST:'127.0.0.1',DB_PORT:'1',DB_USER:'unreachable',DB_PASSWORD:'test-only',DB_NAME:'cataloghub_test'},
    stdio:['ignore','pipe','pipe','ipc']
  });
  t.after(()=>{if(child.exitCode===null) child.kill();});
  let output='';
  await new Promise((resolve,reject)=>{
    child.stdout.on('data',chunk=>{output+=chunk;if(output.includes('CatalogHub listening')) resolve();});
    child.once('error',reject);child.once('exit',code=>{if(!output.includes('CatalogHub listening')) reject(new Error(`Startup exited ${code}`));});
  });
  assert.equal((await fetch(`http://127.0.0.1:${port}/health`)).status,200);
  assert.equal((await fetch(`http://127.0.0.1:${port}/ready`)).status,503);
  const exited=new Promise(resolve=>child.once('exit',(code,signal)=>resolve({code,signal})));
  child.send('test-sigterm');
  const result=await exited;assert.equal(result.code,0);assert.match(output,/Shutting down: SIGTERM/);
});
