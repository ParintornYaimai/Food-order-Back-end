import mongoose from "mongoose";

//connect
export const connectToDB = async()=>{
    try {
        mongoose.connect(process.env.DATABASE as string)
        console.log('connect to DB Success')
    } catch (error) {
        console.log('connect to DB Error')
        process.exit(1)
    }
}
