import { client } from './api.js'

function unwrap(promise){
  return promise.then(res=>res.data).catch(error=>{
    const message=error.response?.data?.error || error.response?.data?.message || error.message || 'Không thể cập nhật bảng màu.'
    throw new Error(message)
  })
}

export function getAdminColors(){
  return unwrap(client.get('/admin/colors'))
}

export function updateAdminColor(id,payload){
  return unwrap(client.put('/admin/colors/'+encodeURIComponent(id),payload))
}
