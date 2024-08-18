"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseServerError = exports.ResponseError = exports.ResponseSuccess = void 0;
// ฟังก์ชันสำหรับการตอบสนองที่สำเร็จ
const ResponseSuccess = (res, data, message = 'Success') => {
    const response = { message, data };
    res.status(200).json(response);
};
exports.ResponseSuccess = ResponseSuccess;
// ฟังก์ชันสำหรับการตอบสนองที่มีข้อผิดพลาด (ไม่พบข้อมูล)
const ResponseError = (res, message = 'Data not found') => {
    const response = { message };
    res.status(404).json(response);
};
exports.ResponseError = ResponseError;
// ฟังก์ชันสำหรับการตอบสนองที่มีข้อผิดพลาดภายในเซิร์ฟเวอร์
const ResponseServerError = (res, message = 'Internal server error') => {
    const response = { message };
    res.status(500).json(response);
};
exports.ResponseServerError = ResponseServerError;
//# sourceMappingURL=index.js.map