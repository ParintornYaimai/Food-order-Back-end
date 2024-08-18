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
exports.GetVandorById = exports.GetVandor = exports.CreateVandor = void 0;
const models_1 = require("../models");
const index_1 = require("../response/index");
const bcrypt_1 = __importDefault(require("bcrypt"));
const CreateVandor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address, pincode, foodType, email, password, ownerName, phone, } = req.body;
    try {
        const existingVandor = yield models_1.Vandor.findOne({ email });
        if (existingVandor) {
            return (0, index_1.ResponseError)(res, "Email not available");
        }
        const EncryptPassword = yield bcrypt_1.default.hash(password, 10);
        const createdVandor = yield models_1.Vandor.create({
            name: name,
            address: address,
            pincode: pincode,
            foodType: foodType,
            email: email,
            password: EncryptPassword,
            salt: "UaF6qMiDcpaQJoq7FqGO",
            ownerName: ownerName,
            phone: phone,
            serviceAvailable: false,
            coverImages: [],
            foods: []
        });
        if (createdVandor) {
            (0, index_1.ResponseSuccess)(res, createdVandor);
        }
        else {
            (0, index_1.ResponseError)(res);
        }
    }
    catch (error) {
        (0, index_1.ResponseServerError)(res);
    }
});
exports.CreateVandor = CreateVandor;
const GetVandor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vendors = yield models_1.Vandor.find();
        if (vendors !== null) {
            return (0, index_1.ResponseSuccess)(res, vendors);
        }
        (0, index_1.ResponseError)(res);
    }
    catch (error) {
        (0, index_1.ResponseError)(res);
    }
});
exports.GetVandor = GetVandor;
const GetVandorById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const vandorsId = yield models_1.Vandor.findById(id);
        if (vandorsId) {
            return (0, index_1.ResponseSuccess)(res, vandorsId);
        }
        ;
        (0, index_1.ResponseError)(res);
    }
    catch (error) {
        console.log('GetVandorById', error);
        (0, index_1.ResponseError)(res);
    }
});
exports.GetVandorById = GetVandorById;
//# sourceMappingURL=AdminController.js.map