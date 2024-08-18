import express from 'express'
import { EditCustomerProfilt, RequestOtp, CustomerVerify, CustomerLogin, CustomerSignUp, GetCustomprofile, CreateOrder, GetOrders, GetOrdeById, AddToCart, GetCart, DeleteAllCart, VerifyOffer, CreatePayment } from '../controllers/CustomerController'
import {ValidateSignature} from '../utility/PasswordUnility'
 

const router = express.Router()


// Signup / Create Customer 
router.post('/signup',CustomerSignUp)

// Login
router.post('/login',CustomerLogin)


// Verify Customer Accout
router.patch('/verify/:customerId',ValidateSignature,CustomerVerify)


//OTP / Requesting OTP 
router.get('/otp/:customerId',ValidateSignature,RequestOtp)


//Profile
router.get('/profile',ValidateSignature,GetCustomprofile)
router.patch('/profile',ValidateSignature,EditCustomerProfilt)

//Apply Offers
router.get('/offer/verify/:offerId/:id',VerifyOffer);


//Cart
router.post('/cart/:id',ValidateSignature,AddToCart);
router.get('/cart/:id',ValidateSignature,GetCart);
router.delete('/cart/:id',ValidateSignature,DeleteAllCart);

//order
router.post('/create-order/:id',ValidateSignature,CreateOrder);
router.get('/orders/:id',ValidateSignature,GetOrders);
router.get('/order/:id',ValidateSignature,GetOrdeById);

//Payment
router.post('/create-payment/:id',CreatePayment)





export { router as CustomerRoute}