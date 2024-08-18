import { Request, Response, NextFunction } from "express";
import { AuthPayload } from "../dto/Auth.dot";



declare global {
    namespace Express {
        interface Request{
            user?: AuthPayload;
        }
    }
}


