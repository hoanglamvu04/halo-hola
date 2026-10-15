import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { getAdminOperationsDashboard } from '../services/adminOperations.service.js';

const router=Router();
router.use(authenticateAdmin);

router.get('/',async(_req,res,next)=>{
  try{res.json(await getAdminOperationsDashboard());}
  catch(error){next(error);}
});

export default router;
