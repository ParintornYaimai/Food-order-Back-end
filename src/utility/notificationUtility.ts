const { Vonage } = require('@vonage/server-sdk');
require('dotenv').config();


//Email


//notifications



// create Vonage




// generate otp
export const GenerateOtp = () =>{
    const  otp = Math.floor(100000 + Math.random() * 900000 )
    let expiry = new Date()
    expiry.setTime(expiry.getTime() + (30 * 60 * 1000))

    return {otp, expiry }
}

const vonage= new Vonage({
    apiKey:process.env.VONAGE_API_KEY,
    apiSecret:process.env.VONAGE_API_SECRET,
});
// send otp
export const onRequestOTP = async(otp: number, toPhoneNumber: string)=>{
    try {
        const response = await vonage.sms.send({
            to: `+66${toPhoneNumber}`,
            from: "Vonage APIs",
            text: `Your OTP is ${otp}`,
        });
        return response;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
}


//payment notification or emails

