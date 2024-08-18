import express, { Request, Response, NextFunction } from 'express';
import { CreateVandor, GetTransactions, GetVandor, GetVandorById, VerifyDeliveryUser, GetDeliveryUser} from '../controllers';


const router = express.Router();

router.post('/vendor', CreateVandor);

router.get('/vendors', GetVandor);
router.get('/vendor/:id', GetVandorById);

router.get('/transaction',GetTransactions);

router.get('/transaction/:id',GetVandorById);
router.put('/delivery/verify',VerifyDeliveryUser);
router.get('/delivery',GetDeliveryUser);

export { router as AdminRoute };