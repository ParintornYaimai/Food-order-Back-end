import {Request, Response,} from 'express'
import { plainToClass } from 'class-transformer'
import { ResponseError, ResponseSuccess, ResponseServerError } from '../response'
import { CreateDeliveryUserInputs, CustomerDoc, UserLoginInputs, EditCustomerProfileInputs, OrdersInputs, CartItems} from '../dto/Customer.dto'
import { validate, ValidationError } from 'class-validator'
import { Customer,DeliveryUser } from '../models'
import { GenerateOtp, onRequestOTP,ValidatePassword, GenerateSignature} from '../utility'
import bcrypt from 'bcrypt'


export const DeliveryUserSignUp =async(req: Request, res: Response)=>{
    
    try {
        const DeliveryUserInputs = plainToClass(CreateDeliveryUserInputs, req.body);

        const inputErrors: ValidationError[] = await validate(DeliveryUserInputs);

        
        if (inputErrors.length > 0) {
            const errorMessages = inputErrors.map(error => 
                Object.values(error.constraints ?? {}).join(', ')
            ).join('; ');
            return ResponseError(res, errorMessages);
        }

        const {email, phone, password, address, firstName, lastName, pincode } = DeliveryUserInputs;
        
        const salt = await bcrypt.genSalt(10)
        const encryptPassword = await bcrypt.hash(password,salt);

        const existDeliveryUser = await DeliveryUser.findOne({email});
        
        if(existDeliveryUser){
            return ResponseError(res,'A Delivery user exist with the provided email ID')
        }else{
            const result = await DeliveryUser.create({
                email,
                password: encryptPassword,
                salt,
                phone,
                firstName,
                lastName,
                address,
                pincode,
                verified: false,
                lat: 0,
                lng: 0,
                isAvailable: false
            }) as unknown as CustomerDoc;
            
            if(result){

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


export const DeliveryUserLogin =async(req: Request, res: Response)=>{
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
        const deliveryUser = await DeliveryUser.findOne({email});

        if(deliveryUser){
            const isMatch = await ValidatePassword(password, deliveryUser.password)
            
            if(isMatch){
                const token = GenerateSignature({
                    _id: deliveryUser._id.toString(),
                    email: deliveryUser.email,
                    verified: deliveryUser.verified
                })

                res.cookie('authToken',token,{httpOnly: true, maxAge: 12 * 60 * 60 * 1000});
                return ResponseSuccess(res,{_id: deliveryUser._id ,email: deliveryUser.email, verified: deliveryUser.verified})
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


export const GetDeliveryUserProfile =async(req: Request, res: Response)=>{
    const Delivery = req.params.id;

    try {
        if(Delivery){
            const profile = await DeliveryUser.findById(Delivery)

            if(profile){
                return ResponseSuccess(res, profile);
            }
        }
        
        ResponseError(res);
    } catch (error) {
        console.log('Error in GetCustomprofile ',error)
        ResponseServerError(res)
    }
}


export const EditDeliveryUserProfile =async(req: Request, res: Response)=>{
    const profileinputs = plainToClass(EditCustomerProfileInputs, req.body);
    const DeliveryUserId = req.params.DeliveryId;

    const profileErrors = await validate(profileinputs,{validationError: {target: false}});
    if(profileErrors.length > 0 ){
        const errorMessages = profileErrors.map(error =>
            Object.values(error.constraints ?? {}).join(',')
        ).join(';')
        return ResponseError(res,errorMessages)
    }

    try {
        const {firstName, lastName, address} = profileinputs
        if(DeliveryUserId){
            const profile = await Customer.findById(DeliveryUserId);

            if(profile){
                profile.firstName = firstName;
                profile.lastName = lastName;
                profile.address = address
                

                await profile.save();
                return ResponseSuccess(res,'Update success')
            }
        }
      
        ResponseError(res);
    } catch (error) {
        console.log('Error in EditCustomerProfilt ',error)
        ResponseServerError(res)
    }
}


export const UpdateDeliveryUserStatus = async(req: Request, res: Response)=>{
    const DeliveryUserId = req.params.DeliveryId
    const {lat, lng} = req.body

    try {
        const profile = await DeliveryUser.findById(DeliveryUserId)        
        
        if(profile){

            if(lat && lng){
                profile.lat = lat;
                profile.lng = lng;
            }

            profile.isAvailable = !profile.isAvailable;
            const result = await profile.save();
            return ResponseSuccess(res,result);
        }

        ResponseError(res,'Error with Update Status');
    } catch (error) {
        ResponseServerError(res)
    }
}
