"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.images = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const imageFolderPath = path_1.default.join(__dirname, 'image');
if (!fs_1.default.existsSync(imageFolderPath)) {
    fs_1.default.mkdirSync(imageFolderPath, { recursive: true });
}
const imageStorage = multer_1.default.diskStorage({
    destination: function (req, res, cb) {
        cb(null, imageFolderPath);
    },
    filename: function (req, file, cb) {
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const uniqueSuffix = `${timestamp}_${file.originalname}`;
        cb(null, uniqueSuffix);
    }
});
exports.images = (0, multer_1.default)({ storage: imageStorage }).array('images', 10);
//# sourceMappingURL=fileUpload.js.map