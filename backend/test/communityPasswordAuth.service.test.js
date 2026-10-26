import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {
  EMAIL_CODE_PURPOSE,
  hashCommunityEmailCode,
  normalizeCommunityEmail,
  passwordIsValid
} from '../src/services/communityPasswordAuth.service.js';
import communityAuthRoutes from '../src/routes/communityAuth.routes.js';

test('registration OTP is scoped to email, purpose and precise pending registration',()=>{
  const email=' USER@Example.com ';
  const code='001234';
  const oldHash='$2b$12$old-hash-for-registration-a';
  const newHash='$2b$12$new-hash-for-registration-b';

  const codeHash=hashCommunityEmailCode(EMAIL_CODE_PURPOSE.VERIFY,email,code,oldHash);
  assert.equal(codeHash,hashCommunityEmailCode(EMAIL_CODE_PURPOSE.VERIFY,'user@example.com',code,oldHash));
  assert.notEqual(codeHash,hashCommunityEmailCode(EMAIL_CODE_PURPOSE.VERIFY,email,code,newHash));
  assert.notEqual(codeHash,hashCommunityEmailCode(EMAIL_CODE_PURPOSE.RESET,email,code));
  assert.notEqual(codeHash,hashCommunityEmailCode(EMAIL_CODE_PURPOSE.VERIFY,'other@example.com',code,oldHash));
  assert.throws(()=>hashCommunityEmailCode('LEGACY_LOGIN',email,code),/Unsupported OTP purpose/);
});

test('password rules enforce bcrypt 72-byte limit',()=>{
  assert.equal(normalizeCommunityEmail('  User@Example.COM  '),'user@example.com');
  assert.equal(passwordIsValid('Password123'),true);
  assert.equal(passwordIsValid('short7'),false);
  assert.equal(passwordIsValid('a'.repeat(72)),true);
  assert.equal(passwordIsValid('a'.repeat(73)),false);
  assert.equal(passwordIsValid('🇻🇳'.repeat(15)),false);
});

test('retired passwordless OTP-login endpoints cannot create a session',async()=>{
  const app=express();
  app.use('/api/community-auth',communityAuthRoutes);
  const server=app.listen(0,'127.0.0.1');
  try{
    await new Promise(resolve=>server.once('listening',resolve));
    const address=server.address();
    for(const endpoint of ['request-code','verify-code']){
      const res=await fetch('http://127.0.0.1:'+address.port+'/api/community-auth/'+endpoint,{
        method:'POST',headers:{'Content-Type':'application/json'},body:'{}'
      });
      assert.equal(res.status,410);
      assert.equal(res.headers.get('set-cookie'),null);
    }
  }finally{
    await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  }
});
