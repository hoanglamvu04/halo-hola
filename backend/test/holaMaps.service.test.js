import test from 'node:test';
import assert from 'node:assert/strict';
import { env } from '../src/config/env.js';
import {
  buildHolaMapsPayload,
  deleteHaloPost,
  syncHaloPost
} from '../src/services/holaMaps.service.js';

const originalFetch = global.fetch;
const original = {
  base: env.holaMapsBaseUrl,
  secret: env.holaMapsHaloSecret,
  publicBaseUrl: env.publicBaseUrl,
  siteUrl: env.haloHolaSiteUrl,
  timeout: env.holaMapsSyncTimeoutMs
};

test.afterEach(() => {
  global.fetch = originalFetch;
  env.holaMapsBaseUrl = original.base;
  env.holaMapsHaloSecret = original.secret;
  env.publicBaseUrl = original.publicBaseUrl;
  env.haloHolaSiteUrl = original.siteUrl;
  env.holaMapsSyncTimeoutMs = original.timeout;
});

function baseSubmission(overrides = {}) {
  return {
    id: 'd9c32b86-e783-4e8e-bd5b-a4ef39f16c4d',
    code: 'HH26-00001',
    name: 'Nguyễn An',
    display_name: 'An',
    email: 'an@example.com',
    title: 'Nắng Hòa Lạc',
    story: 'Một buổi chiều tại Hòa Lạc.',
    type: 'Photo',
    theme: 'Nắng Hòa Lạc',
    location: 'Đồi chè Hòa Lạc',
    location_address: 'Hạ Bằng, Hà Nội',
    location_source: 'HOLA_MAPS',
    created_at: '2026-10-10T02:30:00.000Z',
    ...overrides
  };
}

function imageMedia(id = 'media-1') {
  return [{ id, mime_type: 'image/jpeg' }];
}

test('build payload preserves canonical Hola Maps placeId', () => {
  env.publicBaseUrl = 'https://halohola.xspace.vn';
  env.haloHolaSiteUrl = 'https://halohola.xspace.vn';
  const payload = buildHolaMapsPayload(baseSubmission({
    hola_map_place_id: '123',
    location_lat: 20.99,
    location_lng: 105.52
  }), imageMedia());

  assert.equal(payload.postId, 'd9c32b86-e783-4e8e-bd5b-a4ef39f16c4d');
  assert.equal(payload.location.placeId, '123');
  assert.equal(payload.location.spotId, undefined);
  assert.equal(payload.location.lat, 20.99);
  assert.equal(payload.media[0].url, 'https://halohola.xspace.vn/api/submissions/media/media-1/halo');
  assert.match(payload.sourceUrl, /\/tra-cuu\?code=HH26-00001$/);
});

test('build payload uses custom spotId for a manual pin', () => {
  env.publicBaseUrl = 'https://halohola.xspace.vn';
  const payload = buildHolaMapsPayload(baseSubmission({
    hola_map_place_id: null,
    location_source: 'PIN',
    location_lat: 20.98,
    location_lng: 105.51,
    location: 'Vị trí đã ghim'
  }), imageMedia('media-pin'));

  assert.equal(payload.location.placeId, undefined);
  assert.equal(payload.location.spotId, 'halo-submission:d9c32b86-e783-4e8e-bd5b-a4ef39f16c4d');
  assert.equal(payload.location.lat, 20.98);
  assert.equal(payload.location.lng, 105.51);
});

test('does not build sync payload without image or structured location', () => {
  assert.equal(buildHolaMapsPayload(baseSubmission({ location_lat: 20.9, location_lng: 105.5 }), []), null);
  assert.equal(buildHolaMapsPayload(baseSubmission({ hola_map_place_id: null, location_lat: null, location_lng: null }), imageMedia()), null);
});

test('syncHaloPost sends exact V1 endpoint and secret header', async () => {
  env.holaMapsBaseUrl = 'https://maps.example.test/';
  env.holaMapsHaloSecret = 'shared-secret-test';
  env.holaMapsSyncTimeoutMs = 1000;
  let seen;
  global.fetch = async (url, options) => {
    seen = { url, options };
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const result = await syncHaloPost({ postId: 'post-1', media: [{ url: 'https://halo/image.jpg' }] });
  assert.deepEqual(result, { ok: true });
  assert.equal(seen.url, 'https://maps.example.test/api/halo/v1/posts');
  assert.equal(seen.options.method, 'POST');
  assert.equal(seen.options.headers['X-Halo-Hola-Key'], 'shared-secret-test');
  assert.deepEqual(JSON.parse(seen.options.body), { postId: 'post-1', media: [{ url: 'https://halo/image.jpg' }] });
});

test('deleteHaloPost encodes external post id and authenticates server-to-server', async () => {
  env.holaMapsBaseUrl = 'https://maps.example.test';
  env.holaMapsHaloSecret = 'shared-secret-test';
  let seen;
  global.fetch = async (url, options) => {
    seen = { url, options };
    return new Response(null, { status: 204 });
  };

  await deleteHaloPost('halo/post 12');
  assert.equal(seen.url, 'https://maps.example.test/api/halo/v1/posts/halo%2Fpost%2012');
  assert.equal(seen.options.method, 'DELETE');
  assert.equal(seen.options.headers['X-Halo-Hola-Key'], 'shared-secret-test');
});

test('Hola Maps outage rejects sync call so outbox can mark retry/FAILED', async () => {
  env.holaMapsBaseUrl = 'https://maps.example.test';
  env.holaMapsHaloSecret = 'shared-secret-test';
  global.fetch = async () => new Response(JSON.stringify({ error: 'temporary outage' }), { status: 503 });

  await assert.rejects(
    () => syncHaloPost({ postId: 'post-2', media: [{ url: 'https://halo/image.jpg' }] }),
    /Hola Maps 503: temporary outage/
  );
});
