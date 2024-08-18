"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAvailableOffers = exports.RestaurantById = exports.SearchFoods = exports.GetFoodsIn30Min = exports.GetTopRestaurants = exports.GetFoodAvailability = void 0;
const models_1 = require("../models");
const models_2 = require("../models");
const response_1 = require("../response");
const GetFoodAvailability = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    try {
        const result = yield models_1.Vandor.find({ pincode: pincode, serviceAvailable: true }).sort([['rating', 'descending']]).populate('foods');
        if (result.length > 0) {
            return (0, response_1.ResponseSuccess)(res, result);
        }
    }
    catch (error) {
        (0, response_1.ResponseServerError)(res);
    }
    return (0, response_1.ResponseError)(res, 'data Not found!');
});
exports.GetFoodAvailability = GetFoodAvailability;
const GetTopRestaurants = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    try {
        const result = yield models_1.Vandor.find({ pincode: pincode, serviceAvailable: true }).sort([['rating', 'descending']]).limit(10);
        if (result.length > 0) {
            return (0, response_1.ResponseSuccess)(res, result);
        }
    }
    catch (error) {
        (0, response_1.ResponseServerError)(res);
    }
    return (0, response_1.ResponseError)(res, 'data Not found!');
});
exports.GetTopRestaurants = GetTopRestaurants;
const GetFoodsIn30Min = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    try {
        const result = yield models_1.Vandor.find({ pincode: pincode, serviceAvailable: true }).sort([['rating', 'descending']]).populate('foods');
        if (result.length > 0) {
            let foodResult = [];
            result.map(vendor => {
                const foods = vendor.foods;
                foodResult.push(...foods.filter(food => food.readyTime <= 30));
            });
            return (0, response_1.ResponseSuccess)(res, foodResult);
        }
    }
    catch (error) {
        (0, response_1.ResponseServerError)(res);
    }
    return (0, response_1.ResponseError)(res, 'data Not found!');
});
exports.GetFoodsIn30Min = GetFoodsIn30Min;
const SearchFoods = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    try {
        const result = yield models_1.Vandor.find({ pincode: pincode, serviceAvailable: true })
            .populate('foods');
        if (result.length > 0) {
            let foodResult = [];
            result.map(item => foodResult.push(...item.foods));
            return (0, response_1.ResponseSuccess)(res, foodResult);
        }
    }
    catch (error) {
        (0, response_1.ResponseServerError)(res);
    }
    return (0, response_1.ResponseError)(res, 'data Not found!');
});
exports.SearchFoods = SearchFoods;
const RestaurantById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const result = yield models_1.Vandor.findById(id).populate('foods');
        if (result) {
            return res.status(200).json(result);
        }
    }
    catch (error) {
        (0, response_1.ResponseServerError)(res);
    }
    return (0, response_1.ResponseError)(res, 'data Not found!');
});
exports.RestaurantById = RestaurantById;
const GetAvailableOffers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    try {
        const offers = yield models_2.Offer.find({ pincode: pincode, isActive: true });
        if (offers) {
            return res.status(200).json(offers);
        }
    }
    catch (error) {
        (0, response_1.ResponseServerError)(res);
    }
    return (0, response_1.ResponseError)(res, 'data Not found!');
});
exports.GetAvailableOffers = GetAvailableOffers;
//# sourceMappingURL=ShoppingController.js.map