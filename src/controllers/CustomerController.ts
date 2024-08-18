import {Request, Response,} from 'express'
import { plainToClass } from 'class-transformer'
import { ResponseError, ResponseSuccess, ResponseServerError } from '../response'
import { CreateCustomerInputs, CustomerDoc, UserLoginInputs, EditCustomerProfileInputs, OrdersInputs, CartItems} from '../dto/Customer.dto'
import { validate, ValidationError } from 'class-validator'
import { Customer } from '../models/Customer'
import { GenerateOtp, onRequestOTP,ValidatePassword, GenerateSignature} from '../utility'
import bcrypt from 'bcrypt'
import { Food, Offer, Order, Vandor, Transaction, DeliveryUser } from '../models'
import { Delivery } from '../routes'



export const CustomerSignUp =async(req: Request, res: Response)=>{
    
    try {
        const customerInputs = plainToClass(CreateCustomerInputs, req.body);

        const inputErrors: ValidationError[] = await validate(customerInputs);

        
        if (inputErrors.length > 0) {
            const errorMessages = inputErrors.map(error => 
                Object.values(error.constraints ?? {}).join(', ')
            ).join('; ');
            return ResponseError(res, errorMessages);
        }

        const {email, phone, password } = customerInputs;
        
        const salt = await bcrypt.genSalt(10)
        const encryptPassword = await bcrypt.hash(password,salt);

        const {otp, expiry} = GenerateOtp();

        const existCustomer = await Customer.findOne({email});
        
        if(existCustomer){
            return ResponseError(res,'An user exist with the provided email ID')
        }else{
            const result = await Customer.create({
                email,
                password:encryptPassword,
                salt,
                phone,
                otp,
                otp_expiry: expiry ,
                firstName:'',
                lastName:'',
                address:'',
                verified: false,
                lat: 0,
                lng: 0,
                orders: []
            }) as CustomerDoc;
            
            if(result){
                //send the otp to customer
                await onRequestOTP(otp, phone)
                
                const token = GenerateSignature(
                    { _id: result._id, email: result.email, verified: result.verified }
                )

                res.cookie('authToken', token, { httpOnly: true, maxAge: 12 * 60 * 60 * 1000 });
                return ResponseSuccess(res, { _id: result._id, email: result.email, verified: result.verified });
            };
        }
            
        ResponseError(res)
    } catch (error) {
        console.log('Error in CustomerSignUp ',error)
        ResponseServerError(res)
    }
}

export const CustomerLogin =async(req: Request, res: Response)=>{
    const loginInputs = plainToClass(UserLoginInputs, req.body)
    const loginErrors = await validate(loginInputs, {validationError: {target: false}})

    if(loginErrors.length > 0 ){
        const errorMessages = loginErrors.map(error =>
            Object.values(error.constraints ?? {}).join(',')
        ).join(';')
        return ResponseError(res,errorMessages)
    }

    try {
        const {email, password} = loginInputs
        const userExist = await Customer.findOne({email});

        if(userExist){
            const isMatch = await ValidatePassword(password, userExist.password)
            
            if(isMatch){
                const token = GenerateSignature({
                    _id: userExist._id,
                    email: userExist.email,
                    verified: userExist.verified
                })

                res.cookie('authToken',token,{httpOnly: true, maxAge: 12 * 60 * 60 * 1000});
                return ResponseSuccess(res,{_id: userExist._id ,email: userExist.email, verified: userExist.verified})
            }else{
                return ResponseError(res,"Invalid password")
            }
        }

        ResponseError(res,"Login Error")
    } catch (error) {
        console.log('Error in CustomerLogin ',error)
        ResponseServerError(res)
    }
}

export const CustomerVerify =async(req: Request, res: Response)=>{
    const {otp} = req.body;
    const customerId = req.params.customerId;

    try {
        const profile = await Customer.findById(customerId)
        if(profile){

            if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()){
                profile.verified = true;

                const updatedCustomer = await profile.save();

                const signature = GenerateSignature({
                    _id: updatedCustomer._id,
                    email: updatedCustomer.email,
                    verified: updatedCustomer.verified
                });

                res.cookie('VerifyToken', signature, { httpOnly: true, maxAge: 30 * 60 * 1000  });
                return ResponseSuccess(res,{verified: updatedCustomer.verified,email: updatedCustomer.email});
            }
        }

        ResponseError(res,'Error with OTP Validation');
    } catch (error) {
        console.log('Error in CustomerVerify ',error)
        ResponseServerError(res)
    }
}

export const RequestOtp =async(req: Request, res: Response)=>{
    const customerId = req.params.customerId

    try {
        const profile = await Customer.findById(customerId);
        if(profile){
            const {otp, expiry} = GenerateOtp();

            profile.otp = otp;
            profile.otp_expiry = expiry;
            
            await profile.save();
            await onRequestOTP(otp,profile.phone);

            return ResponseSuccess(res,'OTP has been sent to your phone number. Please check your message.!')
        }

        ResponseError(res)
    } catch (error) {
        console.log('Error in RequestOtp ',error)
        ResponseServerError(res)
    }
}

export const GetCustomprofile =async(req: Request, res: Response)=>{
    const customer = req.params.id;

    try {
        if(customer){
            const profile = await Customer.findById(customer)

            if(profile){
                return ResponseSuccess(res, profile);
            }
        }
        
        ResponseError(res)
    } catch (error) {
        console.log('Error in GetCustomprofile ',error)
        ResponseServerError(res)
    }
}


export const EditCustomerProfilt =async(req: Request, res: Response)=>{
    const profileinputs = plainToClass(EditCustomerProfileInputs, req.body);
    const customerId = req.params.customerId;

    const profileErrors = await validate(profileinputs,{validationError: {target: false}});
    if(profileErrors.length > 0 ){
        const errorMessages = profileErrors.map(error =>
            Object.values(error.constraints ?? {}).join(',')
        ).join(';')
        return ResponseError(res,errorMessages)
    }

    try {
        const {firstName, lastName, address} = profileinputs
        if(customerId){
            const profile = await Customer.findById(customerId);

            if(profile){
                profile.firstName = firstName;
                profile.lastName = lastName;
                profile.address = address
                
                await profile.save();
                return ResponseSuccess(res,'Update success')
            }
        }
      
        ResponseError(res)
    } catch (error) {
        console.log('Error in EditCustomerProfilt ',error)
        ResponseServerError(res)
    }
}

//------------------------------   Createpayment     ------------------------------------

export const CreatePayment =async(req: Request, res: Response)=>{
    const customerId = req.params.id;
    const {amount,paymentMode,offerId} = req.body;

    try{
        let AmountToBePaid = Number(amount);

        if(offerId){
            const appliedOffer = await Offer.findById(offerId);

            if(appliedOffer){

                if(appliedOffer.isActive){
                    AmountToBePaid = (AmountToBePaid - appliedOffer.offerAmount);
                }
            }
        }

        //Perform Payment gateway charge API CALL 

        //right after payment gatway success / failure response

        //create record on Transaction  
        const transaction = await Transaction.create({
            customerId,
            vendorId: '',
            orderId: '',
            orderValue: AmountToBePaid,
            offerUsed: offerId || 'NA',
            status: 'OPEN', // failed // Success
            paymentMode,
            paymentResponse:'Payment is Cash on Delivery',
        })

        //return transaction ID 
        return ResponseSuccess(res,transaction)
    }catch{
        ResponseServerError(res)
    }
}

const assignOrderForDelivery = async(orderId: string, vendorId: string)=>{
    //find the vendor
    const vendor = await Vandor.findById(vendorId)

    if(vendor){
        const areaCode = vendor.pincode;
        const vendorLat = vendor.lat;
        const vendorLng = vendor.lng;

        //find the available Delivery person
        const deliveryPerson = await DeliveryUser.find({ pincode: areaCode, verified: true, isAvailable: true})

        if(deliveryPerson){
            //check rhe nearest delivery person and assign the order
            const currentOrder = await Order.findById(orderId);

            if(currentOrder){
                // update deliveryId;
                // currentOrder.deliveryId = 
                await currentOrder.save();

                // notify to vandor for received new order using firebase push notification
            }

        }
    }


    //update deliveryId
}

const validateTransaction =async(txnId: string)=>{

    const currentTransaction = await Transaction.findById(txnId);

    if(currentTransaction){
        if(currentTransaction.status.toLowerCase() !== 'failed'){
            return {status: true, currentTransaction};
        }
    }

    return { status:false ,currentTransaction }


}

//------------------------------   Create order     ------------------------------------
export const CreateOrder = async(req: Request, res: Response)=>{
    //grab current login customer
    const id = req.params.id;

    //grab order items from reqest  
    const { txnId, amount, items} = <OrdersInputs> req.body; // [{ id: xx , unit: xx}]

    try {

        // validate transaction
        const {status, currentTransaction} = await validateTransaction(txnId);

        if(!status){
            return ResponseError(res,'Error with Create Order!')
        }

        //create an order ID
        const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

        const profile = await Customer.findById(id);
        
        let cartItems = [];
        let netAmount = 0.0;
        let vandorId;


        //Calsulate order amountA
        const foods = await Food.find().where('_id').in(items.map(item => item._id));

        foods.map(food =>{

            items.map(({_id, unit}) =>{
                if(food._id == _id){
                    vandorId = food.vanderId;
                    netAmount += (food.price * unit);
                    cartItems.push({food, unit})
                }else{
                    console.log(`${food._id} / ${_id}`);
                }
            })
        })

        //create order with item description
        if(cartItems) {
            //create order
            const currentOrder = await Order.create({
                orderId,
                vandorId: vandorId,
                items: cartItems,
                totalAmount: netAmount,
                paidAmount: amount,
                orderDate: new Date(),
                orderStatus: 'Waiting',
                remarks:'',
                deliveryId:'',
                readyTime: 45
            })
            
            if(currentOrder){
                profile.cart = [] as any;
                profile.orders.push(currentOrder);

                currentTransaction.vendorId = vandorId;
                currentTransaction.orderId = orderId;
                currentTransaction.status = "CONFIRMED";

                await currentTransaction.save();
                const Id = currentOrder._id as string

                assignOrderForDelivery(Id, vandorId);
                profile.save();
                
                return ResponseSuccess(res,currentOrder)
            }
        }

        //finally update orders to user account
        ResponseError(res,"Error with Create Order");
    } catch (error) {
        ResponseServerError(res)
    }
}


export const GetOrders = async(req: Request, res: Response)=>{
    const customerId = req.params.id

    try {
        if(customerId){
            const profile = await Customer.findById(customerId).populate('orders');

            if(profile){
                return ResponseSuccess(res, profile.orders);
            }
        }

        ResponseError(res);
    } catch (error) {
        ResponseServerError(res);
    }
}

export const GetOrdeById = async(req: Request, res: Response)=>{
    const orderId = req.params.id

    try {
        if(orderId){
            const order = await Order.findById(orderId).populate('items.food');
            return ResponseSuccess(res,order);
        }
    
        ResponseError(res)    
    } catch (error) {
        ResponseServerError(res)
    }
}

//------------------------------   Cart    ------------------------------------
export const AddToCart = async (req: Request, res: Response) => {
    const customerId = req.params.id;
    const { _id, unit } = <CartItems>req.body;

    try {
        const profile = await Customer.findById(customerId).populate('cart.food');

        if (!profile) {
            return ResponseError(res, "Customer not found");
        }

        const food = await Food.findById(_id);

        if (!food) {
            return ResponseError(res, "Food not found");
        }

        let cartItems = profile.cart;

        const existFoodItemIndex = cartItems.findIndex((item) => item.food._id.toString() === _id);

        if (existFoodItemIndex > -1) {
            if (unit > 0) {
                cartItems[existFoodItemIndex] = { food, unit };
            } else {
                cartItems.splice(existFoodItemIndex, 1);
            }
        } else {
            if (unit > 0) {
                cartItems.push({ food, unit });
            }
        }

        profile.cart = cartItems;
        const cartResult = await profile.save();
        return ResponseSuccess(res, cartResult.cart);
        
    } catch (error) {
        return ResponseServerError(res, error);
    }
}


export const GetCart =async(req: Request, res: Response)=>{
    const customerId = req.params.id;

    try {
        const profile = await Customer.findById(customerId);
        if(profile){
            return ResponseSuccess(res,profile.cart);
        }
        
        ResponseError(res,'cart is empty');
    } catch (error) {
        ResponseServerError(res)
    }
}

export const DeleteAllCart =async(req: Request, res: Response)=>{
    const customerId = req.params.id

    try {
        const profile = await Customer.findById(customerId).populate('cart.food');

        if(profile !== null){

            profile.cart = [] as any;
            const cartResult = await profile.save();

            return ResponseSuccess(res,cartResult);
        }

        ResponseError(res);
    } catch (error) {
        ResponseServerError(res)
    }
} 

export const VerifyOffer = async(req: Request, res: Response)=>{
    const offerId = req.params.offerId
    const customer = req.params.id

    try{
        const appliedOffer = await Offer.findById(offerId);

        if(appliedOffer){

            if(appliedOffer.promoType === 'USER'){

                //only can apply once per user 


            }else{

                if(appliedOffer.isActive){
                    return ResponseSuccess(res, appliedOffer ,"Offer is valid")
                }
            }
        }

        ResponseError(res);
    }catch{
        ResponseServerError(res)
    }
}

