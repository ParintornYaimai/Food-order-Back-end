"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRoute = void 0;
const express_1 = __importDefault(require("express"));
const CustomerController_1 = require("../controllers/CustomerController");
const PasswordUnility_1 = require("../utility/PasswordUnility");
const router = express_1.default.Router();
exports.CustomerRoute = router;
// Signup / Create Customer 
router.post('/signup', CustomerController_1.CustomerSignUp);
// Login
router.post('/login', CustomerController_1.CustomerLogin);
//authentication
// Verify Customer Accout
router.patch('/verify/:customerId', PasswordUnility_1.ValidateSignature, CustomerController_1.CustomerVerify);
//OTP / Requesting OTP 
router.get('/otp/:customerId', PasswordUnility_1.ValidateSignature, CustomerController_1.RequestOtp);
//Profile
router.get('/profile', PasswordUnility_1.ValidateSignature, CustomerController_1.GetCustomprofile);
router.patch('/profile', PasswordUnility_1.ValidateSignature, CustomerController_1.EditCustomerProfilt);
//Cart
//order
router.post('create-order:id', CustomerController_1.CreateOrder);
router.get('/orders', CustomerController_1.GetOrders);
router.get('/order/:id', CustomerController_1.GetOrdeById);
//# sourceMappingURL=CustomerRoute.js.map