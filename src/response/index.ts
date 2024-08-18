import { Response } from "express";

// อินเตอร์เฟซสำหรับการตอบสนอง
interface ResponseData {
    message: string;
    data?: any;
}
    
// ฟังก์ชันสำหรับการตอบสนองที่สำเร็จ
export const ResponseSuccess = (res: Response, data: {}, message: string = 'Success') => {
    const response: ResponseData = { message, data };
    res.status(200).json(response);
};

// ฟังก์ชันสำหรับการตอบสนองที่มีข้อผิดพลาด (ไม่พบข้อมูล)
export const ResponseError = (res: Response, message: string = 'Data not found') => {
    const response: ResponseData = { message };
    res.status(404).json(response);
};

// ฟังก์ชันสำหรับการตอบสนองที่มีข้อผิดพลาดภายในเซิร์ฟเวอร์
export const ResponseServerError = (res: Response, message: string = 'Internal server error') => {
    const response: ResponseData = { message };
    res.status(500).json(response);
};
