import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { pool } from '../src/database/pool.js';
import contentRoutes from '../src/routes/content.routes.js';
import adminRoutes from '../src/routes/admin.routes.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { signToken } from '../src/utils/jwt.js';

const fixtureUrl='https://maps.dothihoalac.vn/embed?key=he_'+ 'A'.repeat(32);

test('public read contains only validated URL; ADMIN-only write cannot be bypassed via CMS',async t=>{
  let saved=null;
  let writes=0;
  t.mock.method(pool,'query',async(sql,params=[])=>{
    const query=String(sql).trim();
    if(query.startsWith('SELECT value FROM site_settings')){
      return {rows:saved?[{value:saved}]:[],rowCount:saved?1:0};
    }
    if(query.startsWith('INSERT INTO site_settings')){
      assert.equal(params[0],'hola_embed');
      saved=JSON.parse(params[1]);
      writes+=1;
      return {rows:[],rowCount:1};
    }
    if(query.includes('FROM users WHERE id')){
      const role=params[0]==='staff-admin'?'ADMIN':'MODERATOR';
      return {rows:[{
        id:params[0],name:'Test Staff',email:'staff@example.test',
        role,account_status:'ACTIVE'
      }],rowCount:1};
    }
    throw new Error('Unexpected DB query in embed test: '+query);
  });

  const app=express();
  app.use(express.json());
  app.use('/api',contentRoutes);
  app.use('/api/admin',adminRoutes);
  app.use(errorHandler);
  const server=app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  t.after(()=>new Promise((resolve,reject)=>
    server.close(error=>error?reject(error):resolve())
  ));

  const base='http://127.0.0.1:'+server.address().port;
  const adminToken=signToken({id:'staff-admin',email:'staff@example.test',role:'ADMIN'});
  const moderatorToken=signToken({id:'staff-mod',email:'staff@example.test',role:'MODERATOR'});
  async function call(path,method='GET',body,token){
    const response=await fetch(base+path,{
      method,
      headers:{
        ...(body?{'Content-Type':'application/json'}:{}),
        ...(token?{Authorization:'Bearer '+token}:{})
      },
      ...(body?{body:JSON.stringify(body)}:{})
    });
    return {status:response.status,headers:response.headers,body:await response.json()};
  }

  const missing=await call('/api/hola-embed');
  assert.equal(missing.status,200);
  assert.deepEqual(missing.body,{embedUrl:''});
  assert.match(missing.headers.get('cache-control'),/no-store/);

  const anonymous=await call('/api/admin/hola-embed','PUT',{embedUrl:fixtureUrl});
  assert.equal(anonymous.status,401);
  const moderator=await call('/api/admin/hola-embed','PUT',{embedUrl:fixtureUrl},moderatorToken);
  assert.equal(moderator.status,403);
  const bypass=await call('/api/admin/cms/settings/hola_embed','PUT',{embedUrl:fixtureUrl},moderatorToken);
  assert.equal(bypass.status,403);

  for(const wrong of [
    'https://evil.example/embed?key=he_'+'A'.repeat(32),
    'https://maps.dothihoalac.vn/embed',
    'https://maps.dothihoalac.vn/embed?key=he_bad'
  ]){
    const invalid=await call('/api/admin/hola-embed','PUT',{embedUrl:wrong},adminToken);
    assert.equal(invalid.status,400,wrong);
  }
  assert.equal(writes,0);

  const savedResult=await call('/api/admin/hola-embed','PUT',{embedUrl:fixtureUrl},adminToken);
  assert.equal(savedResult.status,200);
  assert.deepEqual(savedResult.body,{embedUrl:fixtureUrl});
  assert.equal(writes,1);

  const publicResult=await call('/api/hola-embed');
  assert.deepEqual(publicResult.body,{embedUrl:fixtureUrl});
  assert.equal(Object.keys(publicResult.body).length,1);
  assert.match(publicResult.headers.get('cache-control'),/no-store/);

  // A manually corrupted DB row is ignored by both public and ADMIN read.
  saved={embedUrl:'https://evil.example/embed?key='+fixtureUrl.split('key=')[1]};
  assert.deepEqual((await call('/api/hola-embed')).body,{embedUrl:''});

  const cleared=await call('/api/admin/hola-embed','PUT',{embedUrl:''},adminToken);
  assert.deepEqual(cleared.body,{embedUrl:''});
  assert.deepEqual((await call('/api/hola-embed')).body,{embedUrl:''});
  assert.equal(writes,2);
});
