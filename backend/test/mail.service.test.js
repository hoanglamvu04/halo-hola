import test from 'node:test';
import assert from 'node:assert/strict';
import {
  smtpTransportOptions,
  smtpErrorDiagnostic
} from '../src/services/mail.service.js';

test('SMTP transport has bounded network timeouts and Gmail SSL settings', () => {
  const options = smtpTransportOptions({
    host: 'smtp.gmail.com', port: 465, secure: true,
    user: 'sender@example.com', password: 'masked-test-only'
  });
  assert.equal(options.port, 465);
  assert.equal(options.secure, true);
  assert.equal(options.connectionTimeout, 10000);
  assert.equal(options.greetingTimeout, 8000);
  assert.equal(options.socketTimeout, 15000);
  assert.equal(options.dnsTimeout, 8000);
  assert.equal(options.requireTLS, undefined);
  assert.equal(options.auth.user, 'sender@example.com');
  assert.equal(options.auth.pass, 'masked-test-only');

  const startTls = smtpTransportOptions({
    host: 'smtp.gmail.com', port: 587, secure: false,
    user: 'sender@example.com', password: 'test'
  });
  assert.equal(startTls.requireTLS, true);
  assert.equal(startTls.secure, false);
});

test('SMTP diagnostics do not echo credentials or remote server error strings', () => {
  const secret = 'SENSITIVE-SMTP-SECRET-DO-NOT-LEAK';
  const tests = [
    [{code:'EAUTH',responseCode:535,message:secret},'AUTH_FAILED'],
    [{code:'ENOTFOUND',message:secret},'DNS_FAILED'],
    [{code:'ECONNREFUSED',message:secret},'CONNECTION_REFUSED'],
    [{code:'ETIMEDOUT',message:secret},'NETWORK_TIMEOUT'],
    [{code:'ESOCKET',message:secret},'NETWORK_TIMEOUT'],
    [{code:'ETLS',message:'TLS certificate error: '+secret},'TLS_FAILED'],
    [{code:'UNKNOWN',message:secret},'SMTP_FAILED']
  ];
  for (const [error, code] of tests) {
    const result = smtpErrorDiagnostic(error);
    assert.equal(result.code,code);
    assert.ok(result.message.length > 12);
    assert.ok(!result.message.includes(secret));
  }
});
