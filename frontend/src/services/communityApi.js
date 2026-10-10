import { client } from './api.js';

function unwrap(promise) {
  return promise.then(res => res.data).catch(error => {
    const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error');
    const message = isNetworkError
      ? 'Không kết nối được máy chủ HALO HOLA. Vui lòng thử lại sau.'
      : (error.response?.data?.error || error.response?.data?.message || error.message || 'Đăng ký chưa thành công.');
    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    wrapped.details = error.response?.data?.details;
    throw wrapped;
  });
}

export function registerWeHola(payload) {
  return unwrap(client.post('/community-registrations/we-hola', payload));
}

export function registerHolaDay(payload) {
  return unwrap(client.post('/community-registrations/hola-day', payload));
}
