import multer from 'multer';
import fs from 'fs';
import path from 'path';

const imageFolderPath = path.join(__dirname, 'image');
if (!fs.existsSync(imageFolderPath)) {
    fs.mkdirSync(imageFolderPath, { recursive: true });
}

const imageStorage = multer.diskStorage({
    destination: function(req, res, cb){
        cb(null, imageFolderPath)
    },
    filename: function(req, file, cb){
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const uniqueSuffix = `${timestamp}_${file.originalname}`;
        cb(null, uniqueSuffix); 
    }
})

export const images = multer({storage: imageStorage}).array('images',10)