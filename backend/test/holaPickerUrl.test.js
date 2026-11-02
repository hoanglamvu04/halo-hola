import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHolaPickerUrl } from '../../shared/holaEmbedUrl.js';

// Synthetic fixture only: no real embed identifier is stored in source code.
const key = 'he_' + 'A'.repeat(32);
const base = 'https://maps.dothihoalac.vn';

test('picker reuses approved public key and preserves parent origin + location',()=>{
  const embedUrl = base + '/embed?key=' + key;
  const actual = buildHolaPickerUrl(embedUrl, {
    origin: 'https://halohola.vn',
    lat: 21.005,
    lng: 105.525,
    label: 'Thạch Thất & Hòa Lạc'
  });
  const parsed = new URL(actual);
  assert.equal(parsed.origin,base);
  assert.equal(parsed.pathname,'/embed/picker');
  assert.equal(parsed.searchParams.get('key'),key);
  assert.equal(parsed.searchParams.get('origin'),'https://halohola.vn');
  assert.equal(parsed.searchParams.get('lat'),'21.005');
  assert.equal(parsed.searchParams.get('lng'),'105.525');
  assert.equal(parsed.searchParams.get('label'),'Thạch Thất & Hòa Lạc');
  assert.equal(parsed.searchParams.size,5);
});

test('picker key also works with HALO story embed URL and alternative approved domain',()=>{
  const url = buildHolaPickerUrl(base+'/embed/halo?key='+key,{
    origin:'https://halohola.xspace.vn'
  });
  const parsed = new URL(url);
  assert.equal(parsed.pathname,'/embed/picker');
  assert.equal(parsed.searchParams.get('key'),key);
  assert.equal(parsed.searchParams.get('origin'),'https://halohola.xspace.vn');
  assert.equal(parsed.searchParams.has('lat'),false);
  assert.equal(parsed.searchParams.has('lng'),false);
});

test('missing URL, keyless legacy iframe, outside host and malformed key never return iframe src',()=>{
  const invalid=[
    '',undefined,null,base+'/embed',base+'/embed/picker?origin=https://halohola.vn',
    'https://evil.example/embed?key='+key,
    base+'/embed?key=he_fake',
    base+'/other?key='+key,
    base+'/embed?key='+key+'&redirect=https://evil.example'
  ];
  for(const item of invalid){
    assert.equal(buildHolaPickerUrl(item,{origin:'https://halohola.vn'}),'',String(item));
  }
});

test('picker only allows safe exact parent origins and omits invalid coordinates',()=>{
  const embed = base+'/embed?key='+key;
  for(const origin of [
    '',undefined,'javascript:alert(1)','https://halohola.vn.evil.example/path',
    'https://halohola.vn/path','https://halohola.vn/?oops=yes',
    'https://admin:password@halohola.vn','http://halohola.vn'
  ]){
    assert.equal(buildHolaPickerUrl(embed,{origin}),'',String(origin));
  }
  assert.ok(buildHolaPickerUrl(embed,{origin:'http://localhost:5173'}));
  const url = new URL(buildHolaPickerUrl(embed,{
    origin:'https://halohola.vn',lat:'',lng:'',label:'test'
  }));
  assert.equal(url.searchParams.has('lat'),false);
  assert.equal(url.searchParams.has('lng'),false);
  const invalidCoords = new URL(buildHolaPickerUrl(embed,{
    origin:'https://halohola.vn',lat:94,lng:-500
  }));
  assert.equal(invalidCoords.searchParams.has('lat'),false);
  assert.equal(invalidCoords.searchParams.has('lng'),false);
});
