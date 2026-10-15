import { client } from './api.js'

function unwrap(promise){
  return promise.then(res=>res.data).catch(error=>{
    const message=error.response?.data?.error||error.response?.data?.message||error.message||'Đã có lỗi xảy ra.'
    throw new Error(message)
  })
}

export function resyncSubmissionHolaMaps(id){
  return unwrap(client.post('/admin/submissions/'+encodeURIComponent(id)+'/hola-maps-sync'))
}

export function getAdminOperationsDashboard(){
  return unwrap(client.get('/admin/operations-dashboard'))
}
