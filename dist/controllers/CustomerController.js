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
exports.GetOrdeById = exports.GetOrders = exports.CreateOrder = exports.EditCustomerProfilt = exports.GetCustomprofile = exports.RequestOtp = exports.CustomerVerify = exports.CustomerLogin = exports.CustomerSignUp = void 0;
const class_transformer_1 = require("class-transformer");
const response_1 = require("../response");
const Customer_dto_1 = require("../dto/Customer.dto");
const class_validator_1 = require("class-validator");
const Customer_1 = require("../models/Customer");
const utility_1 = require("../utility");
const bcrypt_1 = __importDefault(require("bcrypt"));
const models_1 = require("../models");
const CustomerSignUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customerInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.CreateCustomerInputs, req.body);
        const inputErrors = yield (0, class_validator_1.validate)(customerInputs);
        if (inputErrors.length > 0) {
            const errorMessages = inputErrors.map(error => { var _a; return Object.values((_a = error.constraints) !== null && _a !== void 0 ? _a : {}).join(', '); }).join('; ');
            return (0, response_1.ResponseError)(res, errorMessages);
        }
        const { email, phone, password } = customerInputs;
        const salt = yield bcrypt_1.default.genSalt(10);
        const encryptPassword = yield bcrypt_1.default.hash(password, salt);
        const { otp, expiry } = (0, utility_1.GenerateOtp)();
        const existCustomer = yield Customer_1.Customer.findOne({ email });
        if (existCustomer) {
            return (0, response_1.ResponseError)(res, 'An user exist with the provided email ID');
        }
        else {
            const result = yield Customer_1.Customer.create({
                email,
                password: encryptPassword,
                salt,
                phone,
                otp,
                otp_expiry: expiry,
                firstName: '',
                lastName: '',
                address: '',
                verified: false,
                lat: 0,
                lng: 0,
            });
            if (result) {
                //send the otp to customer
                yield (0, utility_1.onRequestOTP)(otp, phone);
                const token = (0, utility_1.GenerateSignature)({ _id: result._id, email: result.email, verified: result.verified });
                res.cookie('authToken', token, { httpOnly: true, maxAge: 12 * 60 * 60 * 1000 });
                return (0, response_1.ResponseSuccess)(res, { _id: result._id, email: result.email, verified: result.verified });
            }
            ;
        }
        (0, response_1.ResponseError)(res);
    }
    catch (error) {
        console.log('Error in CustomerSignUp ', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.CustomerSignUp = CustomerSignUp;
const CustomerLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loginInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.UserLoginInputs, req.body);
    const loginErrors = yield (0, class_validator_1.validate)(loginInputs, { validationError: { target: false } });
    if (loginErrors.length > 0) {
        const errorMessages = loginErrors.map(error => { var _a; return Object.values((_a = error.constraints) !== null && _a !== void 0 ? _a : {}).join(','); }).join(';');
        return (0, response_1.ResponseError)(res, errorMessages);
    }
    try {
        const { email, password } = loginInputs;
        const userExist = yield Customer_1.Customer.findOne({ email });
        if (userExist) {
            const isMatch = yield (0, utility_1.ValidatePassword)(password, userExist.password);
            if (isMatch) {
                const token = (0, utility_1.GenerateSignature)({
                    _id: userExist._id,
                    email: userExist.email,
                    verified: userExist.verified
                });
                res.cookie('authToken', token, { httpOnly: true, maxAge: 12 * 60 * 60 * 1000 });
                return (0, response_1.ResponseSuccess)(res, { email: userExist.email, verified: userExist.verified });
            }
            else {
                return (0, response_1.ResponseError)(res, "Invalid password");
            }
        }
        (0, response_1.ResponseError)(res, "Login Error");
    }
    catch (error) {
        console.log('Error in CustomerLogin ', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.CustomerLogin = CustomerLogin;
const CustomerVerify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    const customerId = req.params.customerId;
    try {
        const profile = yield Customer_1.Customer.findById(customerId);
        if (profile) {
            if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
                profile.verified = true;
                const updatedCustomer = yield profile.save();
                const signature = (0, utility_1.GenerateSignature)({
                    _id: updatedCustomer._id,
                    email: updatedCustomer.email,
                    verified: updatedCustomer.verified
                });
                res.cookie('VerifyToken', signature, { httpOnly: true, maxAge: 30 * 60 * 1000 });
                return (0, response_1.ResponseSuccess)(res, { verified: updatedCustomer.verified, email: updatedCustomer.email });
            }
        }
        (0, response_1.ResponseError)(res, 'Error with OTP Validation');
    }
    catch (error) {
        console.log('Error in CustomerVerify ', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.CustomerVerify = CustomerVerify;
const RequestOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customerId = req.params.customerId;
    try {
        const profile = yield Customer_1.Customer.findById(customerId);
        if (profile) {
            const { otp, expiry } = (0, utility_1.GenerateOtp)();
            profile.otp = otp;
            profile.otp_expiry = expiry;
            yield profile.save();
            yield (0, utility_1.onRequestOTP)(otp, profile.phone);
            return (0, response_1.ResponseSuccess)(res, 'OTP has been sent to your phone number. Please check your message.!');
        }
        (0, response_1.ResponseError)(res);
    }
    catch (error) {
        console.log('Error in RequestOtp ', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.RequestOtp = RequestOtp;
const GetCustomprofile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.params.id;
    try {
        if (customer) {
            const profile = yield Customer_1.Customer.findById(customer);
            if (profile) {
                return (0, response_1.ResponseSuccess)(res, profile);
            }
        }
        (0, response_1.ResponseError)(res);
    }
    catch (error) {
        console.log('Error in GetCustomprofile ', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.GetCustomprofile = GetCustomprofile;
const EditCustomerProfilt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const profileinputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.EditCustomerProfileInputs, req.body);
    const customerId = req.params.customerId;
    const profileErrors = yield (0, class_validator_1.validate)(profileinputs, { validationError: { target: false } });
    if (profileErrors.length > 0) {
        const errorMessages = profileErrors.map(error => { var _a; return Object.values((_a = error.constraints) !== null && _a !== void 0 ? _a : {}).join(','); }).join(';');
        return (0, response_1.ResponseError)(res, errorMessages);
    }
    try {
        const { firstName, lastName, address } = profileinputs;
        if (customerId) {
            const profile = yield Customer_1.Customer.findById(customerId);
            if (profile) {
                profile.firstName = firstName;
                profile.lastName = lastName;
                profile.address = address;
                yield profile.save();
                return (0, response_1.ResponseSuccess)(res, 'Update success');
            }
        }
        (0, response_1.ResponseError)(res);
    }
    catch (error) {
        console.log('Error in EditCustomerProfilt ', error);
        (0, response_1.ResponseServerError)(res);
    }
});
exports.EditCustomerProfilt = EditCustomerProfilt;
const CreateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //grab current login customer
    const id = req.params.id;
    //grab order items from reqest 
    const cart = req.body; // [{ id: xx , unit: xx}]
    try {
        //create an order ID
        const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;
        const profile = Customer_1.Customer.findById(id);
        let cartItems = [];
        let netAmount = 0.0;
        //Calsulate order amount
        const foods = yield models_1.Food.find().where('_id').in(cart.map(item => item._id)).exec();
        //create order with item description
        //finally update orders to user account
    }
    catch (error) {
        (0, response_1.ResponseServerError)(res);
    }
});
exports.CreateOrder = CreateOrder;
const GetOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        (0, response_1.ResponseServerError)(res);
    }
});
exports.GetOrders = GetOrders;
const GetOrdeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        (0, response_1.ResponseServerError)(res);
    }
});
exports.GetOrdeById = GetOrdeById;
//# sourceMappingURL=CustomerController.js.map