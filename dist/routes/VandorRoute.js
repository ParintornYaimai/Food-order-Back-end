"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VandorRoute = void 0;
const express_1 = __importDefault(require("express"));
const VandorController_1 = require("../controllers/VandorController");
const PasswordUnility_1 = require("../utility/PasswordUnility");
const middlewares_1 = require("../middlewares");
const router = express_1.default.Router();
exports.VandorRoute = router;
router.post('/login', VandorController_1.VandorLogin);
// router.use(ValidateSignature);
router.get('/profile', PasswordUnility_1.ValidateSignature, VandorController_1.GetVandorProfile);
router.patch('/profile', PasswordUnility_1.ValidateSignature, VandorController_1.UpdateVandorProfile);
router.put('/coverImage/:id', PasswordUnility_1.ValidateSignature, middlewares_1.images, VandorController_1.UpdateVanderCoverImage);
router.patch('/service', PasswordUnility_1.ValidateSignature, VandorController_1.UpdateVandorService);
router.post('/food/:id', middlewares_1.images, VandorController_1.addFood);
router.get('/foods/:id', VandorController_1.GetFood);
//# sourceMappingURL=VandorRoute.js.map