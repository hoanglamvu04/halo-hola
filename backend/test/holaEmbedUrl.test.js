import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOLA_MAPS_HOME_URL,
  HOLA_EMBED_KEY_PATTERN,
  validateHolaEmbedUrl,
  getHolaEmbedViewState
} from '../../shared/holaEmbedUrl.js';

// Deliberately synthetic fixtures: never a granted or usable HOLA Maps key.
const fixtureKey = 'he_' + 'A'.repeat(32);
const base = 'https://maps.dothihoalac.vn';

test('accepts only V1 approved path formats and canonicalizes the public URL',()=>{
  assert.equal(HOLA_MAPS_HOME_URL,base+'/');
  assert.equal(HOLA_EMBED_KEY_PATTERN.test(fixtureKey),true);
  for(const path of ['/embed','/embed/halo','/embed/picker']){
    const input=base+path+'?key='+fixtureKey;
    assert.deepEqual(validateHolaEmbedUrl(input),{
      valid:true,url:input,code:'VALID',
      message:'Định dạng URL hợp lệ. Quyền nhúng thực tế vẫn do HOLA Maps kiểm soát.'
    });
    assert.deepEqual(getHolaEmbedViewState(input),{mode:'embed',embedUrl:input});
  }
});

test('no URL, missing key and revoked or blocked identifiers never trigger a keyless fallback',()=>{
  for(const input of ['',undefined,null, '  ',base+'/embed']){
    const validation=validateHolaEmbedUrl(input);
    assert.equal(validation.valid,false);
    assert.deepEqual(getHolaEmbedViewState(input),{mode:'waiting',embedUrl:''});
  }
});

test('rejects incorrect hostname, scheme, port, path and dangerous redirect URL forms',()=>{
  const candidates=[
    'javascript:alert(1)',
    'data:text/html,test',
    'http://maps.dothihoalac.vn/embed?key='+fixtureKey,
    'https://evil.example/embed?key='+fixtureKey,
    'https://maps.dothihoalac.vn.evil.example/embed?key='+fixtureKey,
    'https://evil.example@maps.dothihoalac.vn/embed?key='+fixtureKey,
    'https://maps.dothihoalac.vn:8443/embed?key='+fixtureKey,
    'https://maps.dothihoalac.vn/other?key='+fixtureKey,
    'https://maps.dothihoalac.vn/embed/halo/extra?key='+fixtureKey,
    'https://maps.dothihoalac.vn/embed/?key='+fixtureKey,
    'https://maps.dothihoalac.vn/embed?key='+fixtureKey+'#fragment',
    '//maps.dothihoalac.vn/embed?key='+fixtureKey,
    'https://maps.dothihoalac.vn/em%62ed?key='+fixtureKey
  ];
  for(const input of candidates){
    assert.equal(validateHolaEmbedUrl(input).valid,false,input);
    assert.equal(getHolaEmbedViewState(input).mode,'waiting',input);
  }
});

test('rejects absent, malformed, duplicate or extra embed query keys',()=>{
  const candidates=[
    base+'/embed?key=',
    base+'/embed?foo='+fixtureKey,
    base+'/embed?key=he_abc',
    base+'/embed?key=he_'+('A'.repeat(31)),
    base+'/embed?key=he_'+('A'.repeat(33)),
    base+'/embed?key=ha_'+('A'.repeat(32)),
    base+'/embed?key=he_'+('A'.repeat(31))+'!',
    base+'/embed?key='+fixtureKey+'&key='+fixtureKey,
    base+'/embed?key='+fixtureKey+'&next=https://evil.example',
    base+'/embed?key='+fixtureKey+'%0A'
  ];
  for(const input of candidates){
    assert.equal(validateHolaEmbedUrl(input).valid,false,input);
  }
});

test('no shared secrets or Browser API keys are accepted as public embed identifiers',()=>{
  for(const key of ['HOLA_MAPS_HALO_SECRET','VITE_HOLA_MAPS_API_KEY','hmap_abc123','secret-token']){
    assert.equal(validateHolaEmbedUrl(base+'/embed?key='+key).valid,false);
  }
});
