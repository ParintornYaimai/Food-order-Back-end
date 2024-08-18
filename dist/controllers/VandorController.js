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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFoodDetail = exports.GetFood = exports.addFood = exports.UpdateVandorService = exports.UpdateVanderCoverImage = exports.UpdateVandorProfile = exports.GetVandorProfile = exports.VandorLogin = void 0;
const response_1 = require("../response");
const models_1 = require("../models");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const VandorLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const userExist = yield models_1.Vandor.findOne({ email });
        if (!userExist) {
            return (0, response_1.ResponseError)(res, 'User not found');
        }
        const isMatch = yield bcrypt_1.default.compare(password, userExist.password);
        if (isMatch) {
            const secret = process.env.JWT_SECRET || "JOHisvkGyui";
            const payload = {
                _id: userExist.id,
                email: userExist.email,
                name: userExist.name,
            };
            const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '1d' });
            const expiryDate = new Date(Date.now() + 86400000); // 1 day = 86400000 milliseconds
            res.cookie('access_token', token, {
                httpOnly: true,
                sameSite: "strict",
                expires: expiryDate
            });
            (0, response_1.ResponseSuccess)(res, userExist);
        }
        else {
            return (0, response_1.ResponseError)(res, 'Invalid password');
        }
    }
    catch (error) {
        console.error('Error in VandorLogin:', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.VandorLogin = VandorLogin;
const GetVandorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.params.id;
    try {
        if (!user) {
            return (0, response_1.ResponseError)(res, 'User not authenticated');
        }
        const userExist = yield models_1.Vandor.findById(user);
        if (!userExist) {
            return (0, response_1.ResponseError)(res, 'User not found');
        }
        (0, response_1.ResponseSuccess)(res, userExist);
    }
    catch (error) {
        console.error('Error in GetVandorProfile:', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.GetVandorProfile = GetVandorProfile;
const UpdateVandorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.params.id;
    const { name, address, phone, foodType } = req.body;
    try {
        if (!user) {
            return (0, response_1.ResponseError)(res, 'User not authenticated');
        }
        const userExist = yield models_1.Vandor.findById(user);
        if (!userExist) {
            return (0, response_1.ResponseError)(res, 'User not found');
        }
        const updated = yield models_1.Vandor.findByIdAndUpdate(user, { $set: {
                name,
                address,
                phone,
                foodType
            } }, { new: true });
        if (!updated) {
            return (0, response_1.ResponseError)(res, 'Failed to update user');
        }
        (0, response_1.ResponseSuccess)(res, updated);
    }
    catch (error) {
        console.error('Error in UpdateVandorProfile:', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.UpdateVandorProfile = UpdateVandorProfile;
const UpdateVanderCoverImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const files = req.files;
    try {
        if (!userId) {
            return (0, response_1.ResponseError)(res, 'User ID is required');
        }
        const vandor = yield models_1.Vandor.findById(userId);
        if (!vandor) {
            return (0, response_1.ResponseError)(res, 'Vandor not found, please login');
        }
        if (!files || files.length === 0) {
            return (0, response_1.ResponseError)(res, 'No images uploaded');
        }
        const images = files.map((file) => file.filename);
        vandor.coverImages.push(...images);
        const result = yield vandor.save();
        if (result) {
            (0, response_1.ResponseSuccess)(res, result, 'image update successfully');
        }
        else {
            (0, response_1.ResponseError)(res, 'Failed to image update');
        }
    }
    catch (error) {
        console.error('Error in UpdateVanderCoverImage:', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.UpdateVanderCoverImage = UpdateVanderCoverImage;
const UpdateVandorService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.params.id;
    try {
        if (!user) {
            return (0, response_1.ResponseError)(res, 'User not authenticated');
        }
        const userExist = yield models_1.Vandor.findById(user);
        if (!userExist) {
            return (0, response_1.ResponseError)(res, 'User not found');
        }
        const newServiceAvailable = !userExist.serviceAvailable;
        const updated = yield models_1.Vandor.findByIdAndUpdate(user, { $set: {
                serviceAvailable: newServiceAvailable
            } }, { new: true });
        if (!updated) {
            return (0, response_1.ResponseError)(res, 'Failed to update user');
        }
        (0, response_1.ResponseSuccess)(res, updated);
    }
    catch (error) {
        console.error('Error in UpdateVandorService:', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.UpdateVandorService = UpdateVandorService;
const addFood = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, category, foodType, readyTime, price } = req.body;
    const userId = req.params.id;
    const files = req.files;
    try {
        if (!userId) {
            return (0, response_1.ResponseError)(res, 'User ID is required');
        }
        const vandor = yield models_1.Vandor.findById(userId);
        if (!vandor) {
            return (0, response_1.ResponseError)(res, 'Vandor not found, please login');
        }
        if (!files || files.length === 0) {
            return (0, response_1.ResponseError)(res, 'No images uploaded');
        }
        const images = files.map((file) => file.filename);
        const newFood = yield models_1.Food.create({
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
        const result = yield vandor.save();
        if (result) {
            (0, response_1.ResponseSuccess)(res, result, 'Food added successfully');
        }
        else {
            (0, response_1.ResponseError)(res, 'Failed to add food');
        }
    }
    catch (error) {
        console.error('Error in addFood:', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.addFood = addFood;
const GetFood = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        if (!userId) {
            return (0, response_1.ResponseError)(res, 'user ID is required');
        }
        const food = yield models_1.Food.find({ vandorId: userId });
        if (food.length > 0) {
            return (0, response_1.ResponseSuccess)(res, food);
        }
        else {
            return (0, response_1.ResponseError)(res);
        }
    }
    catch (error) {
        console.error('Error in GetFood:', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.GetFood = GetFood;
const GetFoodDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foodId = req.params.id;
    try {
        if (!foodId) {
            return (0, response_1.ResponseError)(res, 'Food ID is required');
        }
        const food = yield models_1.Food.findById(foodId);
        if (food) {
            return (0, response_1.ResponseSuccess)(res, food);
        }
        else {
            return (0, response_1.ResponseError)(res);
        }
    }
    catch (error) {
        console.error('Error in GetFoodDetail:', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.GetFoodDetail = GetFoodDetail;
//# sourceMappingURL=VandorController.js.map