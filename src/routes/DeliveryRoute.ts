import express from 'express'
import { DeliveryUserSignUp, DeliveryUserLogin, GetDeliveryUserProfile, EditDeliveryUserProfile, UpdateDeliveryUserStatus, VerifyDeliveryUser } from '../controllers/'
import {ValidateSignature} from '../utility/PasswordUnility'
 

const router = express.Router()

// Signup / Create Customer 
router.post('/signup',DeliveryUserSignUp);

// Login
router.post('/login',DeliveryUserLogin);

// Chage Service status
router.put('/change-status/:DeliveryId',ValidateSignature,EditDeliveryUserProfile);

//Profile
router.get('/profile',ValidateSignature,GetDeliveryUserProfile);
router.patch('/profile/:DeliveryId',ValidateSignature,UpdateDeliveryUserStatus);


export { router as Delivery}