import { Request, Response, NextFunction } from "express";
import { ResponseError, ResponseServerError, ResponseSuccess } from "../response";
import { VandorLogintype, vandorPayload, EditVandorInputs, CreateOfferInputs } from "../dto";
import { Vandor, Food, Order, Customer, Offer} from "../models";


import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CreateFoodInputs } from "../dto/Food.dto";



export const VandorLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = <VandorLogintype>req.body;

    try {
        const userExist = await Vandor.findOne({ email });
        if (!userExist) {
            return ResponseError(res, 'User not found');
        }

        const isMatch = await bcrypt.compare(password, userExist.password);

        if (isMatch) {
            const secret = process.env.JWT_SECRET || "JOHisvkGyui";
            const payload: vandorPayload = {
                _id: userExist.id,
                email: userExist.email, 
                name: userExist.name, 
            }

            const token = jwt.sign(payload, secret, { expiresIn: '1d' });

            const expiryDate = new Date(Date.now() + 86400000); // 1 day = 86400000 milliseconds

            res.cookie('access_token', token, {
                httpOnly: true,
                sameSite: "strict",
                expires: expiryDate
            })
            ResponseSuccess(res,userExist)
        } else {
            return ResponseError(res, 'Invalid password');
        }
    } catch (error) {
        console.error('Error in VandorLogin:', error);
        ResponseServerError(res);
    }
};

export const GetVandorProfile =async(req: Request, res:Response)=>{
    const user = req.params.id;

    try {
        if (!user) {
            return ResponseError(res, 'User not authenticated');
        }
        
        const userExist = await Vandor.findById(user)

        if (!userExist) {
            return ResponseError(res, 'User not found');
        }
        ResponseSuccess(res,userExist)
    } catch (error) {
        console.error('Error in GetVandorProfile:', error);
        ResponseServerError(res);
    }
}

export const UpdateVandorProfile =async(req: Request, res:Response)=>{
    const user = req.params.id;
    const { name, address, phone, foodType } = <EditVandorInputs>req.body;
    
    try {
        if (!user) {
            return ResponseError(res, 'User not authenticated');
        }
        
        const userExist = await Vandor.findById(user)

        if (!userExist) {
            return ResponseError(res, 'User not found');
        }
            const updated = await Vandor.findByIdAndUpdate(user,{$set:{
                name,
                address,
                phone,
                foodType
            }},{new: true})

            if (!updated) {
                return ResponseError(res, 'Failed to update user');
            }
            ResponseSuccess(res,updated)
        
    } catch (error) {
        console.error('Error in UpdateVandorProfile:', error);
        ResponseServerError(res);
    }
}

export const UpdateVanderCoverImage =async(req: Request, res:Response)=>{
    const userId = req.params.id;
    const files = req.files as Express.Multer.File[]

    try {
        if (!userId) {
            return ResponseError(res, 'User ID is required');
        }

        const vandor = await Vandor.findById(userId);

        if (!vandor) {
            return ResponseError(res, 'Vandor not found, please login');
        }

        if (!files || files.length as number === 0) {
            return ResponseError(res, 'No images uploaded');
        }

        const images = files.map((file: Express.Multer.File) => file.filename);

        vandor.coverImages.push(...images);
        const result = await vandor.save();

        if (result) {
            ResponseSuccess(res,result,'image update successfully', );
        } else {
            ResponseError(res, 'Failed to image update');
        }
    } catch (error) {
        console.error('Error in UpdateVanderCoverImage:', error);
        ResponseServerError(res);
    }
}

export const UpdateVandorService =async(req: Request, res:Response)=>{
    const user = req.params.id;
    const { lat, lng } = req.body;
    
    try {
        if (!user) {
            return ResponseError(res, 'User not authenticated');
        }
        
        const userExist = await Vandor.findById(user)

        if (!userExist) {
            return ResponseError(res, 'User not found');
        }

        const newServiceAvailable = !userExist.serviceAvailable;
        const updated = await Vandor.findByIdAndUpdate(user,{$set:{
            serviceAvailable: newServiceAvailable
        }},{new: true})
        
        if(lat && lng){
            userExist.lat = lat;
            userExist.lng = lng;
        }

        const result = await userExist.save()

        if (!updated) {
            return ResponseError(res, 'Failed to update user');
        }

        ResponseSuccess(res,updated)
    } catch (error) {
        console.error('Error in UpdateVandorService:', error);
        ResponseServerError(res);
    }
}

export const addFood =async(req: Request, res:Response)=>{
    const { name, description, category, foodType, readyTime, price } = req.body as CreateFoodInputs;
    const userId = req.params.id;
    const files = req.files as Express.Multer.File[]

    try {
        if (!userId) {
            return ResponseError(res, 'User ID is required');
        }

        const vandor = await Vandor.findById(userId);

        if (!vandor) {
            return ResponseError(res, 'Vandor not found, please login');
        }

        if (!files || files.length as number === 0) {
            return ResponseError(res, 'No images uploaded');
        }

        const images = files.map((file: Express.Multer.File) => file.filename);

        const newFood = await Food.create({
            vandorId: vandor._id,
            name,
            description,
            category,
            foodType,
            images, 
            readyTime,
            price,
            rating: 0
        });

        vandor.foods.push(newFood);
        const result = await vandor.save();

        if (result) {
            ResponseSuccess(res,result,'Food added successfully', );
        } else {
            ResponseError(res, 'Failed to add food');
        }
    } catch (error) {
        console.error('Error in addFood:', error);
        ResponseServerError(res);
    }
}

export const GetFood =async(req: Request, res:Response)=>{
    const userId = req.params.id;
    
    try {
        if (!userId) {
            return ResponseError(res, 'user ID is required');
        }

        const food = await Food.find({ vandorId: userId });

        if (food.length > 0) {
            return ResponseSuccess(res, food);
        } else {
            return ResponseError(res);
        }
    } catch (error) {
        console.error('Error in GetFood:', error);
        ResponseServerError(res);
    }
}
 
export const GetFoodDetail =async(req: Request, res:Response)=>{
    const foodId = req.params.id;
    
    try {
        if (!foodId) {
            return ResponseError(res, 'Food ID is required');
        }

        const food = await Food.findById(foodId);

        if (food) {
            return ResponseSuccess(res, food);
        } else {
            return ResponseError(res);
        }
    } catch (error) {
        console.error('Error in GetFoodDetail:', error);
        ResponseServerError(res);
    }
}

export const GetCurrentOrders = async(req: Request, res: Response)=>{
    const userId = req.params.id

    try {
        const orders = await Order.find({ vandorId: userId}).populate('items.food')
        if(orders !== null){
            return ResponseSuccess(res,orders);
        }

        ResponseError(res,"Order not found!");
    } catch (error) {
        ResponseServerError(res)
    }
}

export const GetOrderDetails = async(req: Request, res: Response)=>{
    const orderId = req.params.id

    try {
        const order = await Order.findById(orderId).populate('items.food')

        if(order !== null){
            return ResponseSuccess(res,order);
        }

        ResponseError(res,"Order not found!");
    } catch (error) {
        ResponseServerError(res)
    }
}

export const ProcessOrder = async(req: Request, res: Response)=>{
    const orderId = req.params.id;
    const {status, remarks, time } = req.body; // ACCEPT , REJECT, UNDER-PROCESS ,READY

    try {
        const  order = await Order.findById(orderId).populate('food');

        order.orderStatus = status;
        order.remarks = remarks;
        if(time){
            order.readyTime =  time;
        };

        const orderResult = await order.save();
        if(orderResult !== null){
            return ResponseSuccess(res,orderResult);
        };

        ResponseError(res,"Unable to process Order!");
    } catch (error) {
        ResponseServerError(res);
    }
}


export const GetOffers = async(req: Request, res: Response)=>{
    const id = req.params.id;

    try {
        if(id){
            const offers = await Offer.find().populate('vendors');
            
            let currentOffers = [];
            if(offers){
                
                offers.map((item) =>{
                    if(item.vendors){
                        item.vendors.map((vendor) =>{
                            if(vendor._id.toString() === id){
                                currentOffers.push(item);
                            }
                        })
                    }

                    if(item.offerType === "GENERIC"){
                        currentOffers.push(item);
                    }
                })
            }
            return ResponseSuccess(res,currentOffers)
        }

       ResponseError(res)
    } catch (error) {
        ResponseServerError(res)
    }
}


export const AddOffers = async(req: Request, res: Response)=>{
    const id = req.params.id;
    const { title, description, offerType, offerAmount, pincode, promocode, 
        promoType, startValidity, endValidity, bank, bins, minValue, isActive  
    } = <CreateOfferInputs>req.body;

    try {
        const vander = await Vandor.findById(id);
        if(vander){

            const offer = await Offer.create({
                title,
                description,
                offerType,
                offerAmount,
                pincode,
                promocode,
                promoType,
                startValidity,
                endValidity,
                bank,
                bins,
                minValue,
                vendors:[vander],
                isActive,
            })

            console.log(offer);
            return ResponseSuccess(res,offer);
        }
        
        ResponseError(res,"Unable to Add Offer!");
    } catch (error) {
        ResponseServerError(res)
    }
}

export const EditOffers = async(req: Request, res: Response)=>{
    const id = req.params.id;
    const offerId = req.params.offerId;
    const { title, description, offerType, offerAmount, pincode, promocode, 
        promoType, startValidity, endValidity, bank, bins, minValue, isActive } = <CreateOfferInputs>req.body;

    try {
        const currentOffers = await Offer.findById(offerId)        
        if(currentOffers){
            const vander = await Vandor.findById(id);
            console.log(vander)
            if(vander){ 
                currentOffers.title = title;
                currentOffers.description = description;
                currentOffers.offerType = offerType;
                currentOffers.offerAmount = offerAmount;
                currentOffers.pincode = pincode;
                currentOffers.promocode = promocode;
                currentOffers.promoType = promoType;
                currentOffers.startValidity = startValidity;
                currentOffers.endValidity = endValidity;
                currentOffers.bank = bank;
                currentOffers.bins = bins;
                currentOffers.minValue = minValue;
                currentOffers.isActive = isActive;

                const result = await currentOffers.save();
                return ResponseSuccess(res,result)
            }
        }

        ResponseError(res);
    } catch (error) {
        ResponseServerError(res)
    }
}



