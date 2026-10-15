import test from 'node:test';
import assert from 'node:assert/strict';
import { env } from '../src/config/env.js';
import { buildHolaMapsPayload, isSubmissionEligibleForHolaMaps } from '../src/services/holaMaps.service.js';

const base={
  id:'11111111-2222-4333-8444-555555555555',
  code:'HH26-FLOW01',
  name:'Tác giả kiểm thử',
  display_name:'Tác giả kiểm thử',
  email:'flow@example.com',
  title:'Một ngày ở Hòa Lạc',
  story:'Câu chuyện kiểm thử luồng nhận bài, duyệt, công bố và HOLA Maps.',
  type:'Photo',
  theme:'Nắng Hòa Lạc',
  color:'Nắng',
  location:'Hòa Lạc, Hà Nội',
  location_source:'PIN',
  location_lat:20.99552,
  location_lng:105.52518,
  location_address:'Hòa Lạc, Hà Nội',
  is_demo:false,
  allow_media_use:true,
  rights_confirmed:true,
  image_consent_confirmed:true,
  is_minor:false,
  guardian_consent:false,
  created_at:'2026-10-15T01:00:00.000Z',
  publish_scheduled_at:null
};

const media=[{id:'media-flow-1',mime_type:'image/jpeg'}];

function state(status,publication_state,extra={}){
  return {...base,status,publication_state,...extra};
}

test('submission lifecycle stays off Maps until both moderation and publication are effective',()=>{
  const received=state('PENDING','HIDDEN');
  const approved=state('VALID','HIDDEN');
  const published=state('VALID','PUBLISHED',{published_at:'2026-10-15T02:00:00.000Z'});
  const hiddenAgain=state('VALID','HIDDEN');
  const rejected=state('REJECTED','HIDDEN');

  assert.equal(isSubmissionEligibleForHolaMaps(received),false,'new submission must not sync');
  assert.equal(isSubmissionEligibleForHolaMaps(approved),false,'approved but hidden must not sync');
  assert.equal(isSubmissionEligibleForHolaMaps(published),true,'approved + published must sync');
  assert.equal(isSubmissionEligibleForHolaMaps(hiddenAgain),false,'hidden publication must stop sync');
  assert.equal(isSubmissionEligibleForHolaMaps(rejected),false,'rejected submission must stay off Maps');
});

test('scheduled publication only becomes Maps-eligible when schedule is effective',()=>{
  const future=state('VALID','SCHEDULED',{publish_scheduled_at:'2099-10-15T02:00:00.000Z'});
  const past=state('VALID','SCHEDULED',{publish_scheduled_at:'2020-10-15T02:00:00.000Z'});
  assert.equal(isSubmissionEligibleForHolaMaps(future),false);
  assert.equal(isSubmissionEligibleForHolaMaps(past),true);
});

test('published Maps payload uses stable HALO URLs and carries provenance',()=>{
  const oldPublicBase=env.publicBaseUrl;
  const oldSiteUrl=env.haloHolaSiteUrl;
  try{
    env.publicBaseUrl='https://halohola.vn';
    env.haloHolaSiteUrl='https://halohola.vn';
    const payload=buildHolaMapsPayload(state('VALID','PUBLISHED',{published_at:'2026-10-15T02:00:00.000Z'}),media);
    assert.ok(payload);
    assert.equal(payload.postId,base.id);
    assert.equal(payload.metadata.source,'HALO_HOLA');
    assert.equal(payload.metadata.code,'HH26-FLOW01');
    assert.equal(payload.location.spotId,`halo-submission:${base.id}`);
    assert.equal(payload.media[0].url,'https://halohola.vn/api/submissions/media/media-flow-1/halo');
    assert.equal(payload.media[0].thumbnailUrl,payload.media[0].url);
    assert.equal(payload.sourceUrl,'https://halohola.vn/tac-pham/hh26-flow01');
  }finally{
    env.publicBaseUrl=oldPublicBase;
    env.haloHolaSiteUrl=oldSiteUrl;
  }
});

test('rights and structured media/location remain hard gates after publication',()=>{
  assert.equal(isSubmissionEligibleForHolaMaps(state('VALID','PUBLISHED',{allow_media_use:false})),false);
  assert.equal(isSubmissionEligibleForHolaMaps(state('VALID','PUBLISHED',{rights_confirmed:false})),false);
  assert.equal(isSubmissionEligibleForHolaMaps(state('VALID','PUBLISHED',{image_consent_confirmed:false})),false);
  assert.equal(isSubmissionEligibleForHolaMaps(state('VALID','PUBLISHED',{is_minor:true,guardian_consent:false})),false);
  assert.equal(buildHolaMapsPayload(state('VALID','PUBLISHED',{location_lat:null,location_lng:null,hola_map_place_id:null}),media),null);
  assert.equal(buildHolaMapsPayload(state('VALID','PUBLISHED'),[]),null);
});
