import { Request, Response, NextFunction } from "express";
import { ResponseError, ResponseServerError, ResponseSuccess } from "../response";
import jwt from 'jsonwebtoken'
import { AuthPayload } from "../dto/Auth.dot";
import bcrypt from 'bcrypt'


export const ValidateSignature =async(req: Request, res: Response, next: NextFunction)=>{
    const token = req.cookies.access_token || req.cookies.authToken || req.headers.authorization?.split(' ')[1];
    if(!token){
        return ResponseError(res,'You Need To Login');
    }
    const secret = process.env.JWT_SECRET || "JOHisvkGyui";
    jwt.verify(token,secret,(err: any,user: any)=>{
        if(err){
            return ResponseError(res,'Invalid token' );
        }
        (req as any).user = user; 
        next()
    })
}


export const GenerateSignature =(payload: AuthPayload)=>{
    if(!process.env.JWT_SECRET ){
        throw new Error('JWT_SECRET environment variable is not set');
    } 
    return jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'1d'})
}

export const ValidatePassword=async(plainPassword:string, hashedPassword:string)=>{
    return await bcrypt.compare(plainPassword, hashedPassword);
}