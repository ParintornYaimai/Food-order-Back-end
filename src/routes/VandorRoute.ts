import express from 'express';
import {VandorLogin, GetVandorProfile, UpdateVandorProfile, UpdateVandorService, addFood, GetFood, UpdateVanderCoverImage, GetCurrentOrders, GetOrderDetails, ProcessOrder, GetOffers, AddOffers, EditOffers} from '../controllers/VandorController'
import {ValidateSignature} from '../utility/PasswordUnility'
import {images} from '../middlewares'


const router = express.Router();


router.post('/login',VandorLogin);

//profile
router.get('/profile',ValidateSignature,GetVandorProfile);
router.patch('/profile',ValidateSignature,UpdateVandorProfile);
router.put('/coverImage/:id',ValidateSignature,images,UpdateVanderCoverImage);
router.patch('/service',ValidateSignature,UpdateVandorService);

//food 
router.post('/food/:id',images,addFood);
router.get('/foods/:id',GetFood);

//orders
router.get('/orders/:id',ValidateSignature,GetCurrentOrders)
router.put('/orders/:id/process',ValidateSignature,ProcessOrder)
router.get('/orders/:id',ValidateSignature,GetOrderDetails)

//offers
router.get('/offers/:id',GetOffers)
router.post('/offers/:id',AddOffers)
router.put('/offer/:id/:offerId',EditOffers)

//delete offers


export {router as VandorRoute};