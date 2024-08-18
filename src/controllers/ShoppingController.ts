import { Request, Response, NextFunction } from 'express';
import { FoodDoc, Vandor } from '../models';
import { Offer } from '../models';
import { ResponseError, ResponseServerError, ResponseSuccess } from '../response';


export const GetFoodAvailability = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;

    try {
        const result = await Vandor.find({ pincode: pincode, serviceAvailable: true}).sort([['rating', 'descending']]).populate('foods')

        if(result.length > 0){
            return ResponseSuccess(res,result);
        }

    } catch (error) {
        ResponseServerError(res);
    }

    return ResponseError(res,'data Not found!');
}

export const GetTopRestaurants = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    
    try {
        const result = await Vandor.find({ pincode: pincode, serviceAvailable: true}).sort([['rating', 'descending']]).limit(10)
    
        if(result.length > 0){
            return ResponseSuccess(res,result);
        }
        
    } catch (error) {
        ResponseServerError(res);
    }
    return ResponseError(res,'data Not found!');
}

export const GetFoodsIn30Min = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;

    try {
        const result = await Vandor.find({ pincode: pincode, serviceAvailable: true}).sort([['rating', 'descending']]).populate('foods');
     
        if(result.length > 0){
            let foodResult: any = [];
            result.map(vendor => {
                const foods = vendor.foods as [FoodDoc];
                foodResult.push(...foods.filter(food => food.readyTime <= 30));
            })
            return ResponseSuccess(res,foodResult);
        }
        
    } catch (error) {
        ResponseServerError(res);
    }
    return ResponseError(res,'data Not found!');
}

export const SearchFoods = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;

    try {
        const result = await Vandor.find({ pincode: pincode, serviceAvailable: true})
        .populate('foods');
    
        if(result.length > 0){
            let foodResult: any = [];
            result.map(item => foodResult.push(...item.foods));
            return ResponseSuccess(res,foodResult);
        }
        
    } catch (error) {
        ResponseServerError(res);
    }
    return ResponseError(res,'data Not found!');
}

export const RestaurantById = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    
    try {
        const result = await Vandor.findById(id).populate('foods')
        
        if(result){
            return res.status(200).json(result);
        }
    } catch (error) {
        ResponseServerError(res);
    }

    return ResponseError(res,'data Not found!');
}


export const GetAvailableOffers = async (req: Request, res: Response, next: NextFunction) => {
    const pincode = req.params.pincode;
    console.log(pincode);
    try {
        
        const offers = await Offer.find({ pincode, isActive: true});

        if(offers){
            return ResponseSuccess(res,offers);
        }
        
        ResponseError(res);
    } catch (error) {
        ResponseServerError(res);
    }

}