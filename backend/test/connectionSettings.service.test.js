import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptConnectionSecret, decryptConnectionSecret, getConnectionConfig, isConnectionConfigured, smtpConfigurationIssue } from '../src/services/connectionSettings.service.js';

test('encrypted credentials round trip without plaintext persistence', () => {
  const secret='mail-app-password:with:characters';
  const encrypted=encryptConnectionSecret(secret);
  assert.match(encrypted,/^v1:/);
  assert.ok(!encrypted.includes(secret));
  assert.equal(decryptConnectionSecret(encrypted),secret);
  assert.notEqual(encryptConnectionSecret(secret),encrypted);
});

test('invalid or tampered credentials are rejected', () => {
  assert.throws(()=>decryptConnectionSecret('plaintext-secret'));
  const encrypted=encryptConnectionSecret('valid');
  assert.throws(()=>decryptConnectionSecret(encrypted.slice(0,-2)+'XX'));
});

test('connection configuration never reports incomplete SMTP as ready', () => {
  const config=getConnectionConfig('smtp');
  assert.equal(typeof config.host,'string');
  assert.equal(isConnectionConfigured('smtp',{enabled:true,host:'smtp.example.com',fromAddress:'',user:'x',password:'y'}),false);
  assert.equal(isConnectionConfigured('smtp',{enabled:false,host:'smtp.example.com',fromAddress:'a@example.com',user:'x',password:'y'}),false);
});

test('Gmail 457 typo is detected before opening a socket', () => {
  const base = {host:'smtp.gmail.com',port:457,secure:true};
  assert.match(smtpConfigurationIssue(base),/465/);
  assert.match(smtpConfigurationIssue(base),/587/);
  assert.equal(smtpConfigurationIssue({...base,port:465,secure:true}),'');
  assert.equal(smtpConfigurationIssue({...base,port:587,secure:false}),'');
  assert.match(smtpConfigurationIssue({...base,port:587,secure:true}),/STARTTLS/);
  assert.match(smtpConfigurationIssue({...base,port:465,secure:false}),/SSL/);
  assert.equal(smtpConfigurationIssue({...base,host:'mail.other-provider.test',port:2525,secure:true}),'');
});
