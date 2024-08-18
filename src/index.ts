import express, { Request, Response } from 'express';
import App from './services/ExpressApp';
import {connectToDB } from './config/index'



const StartServer =async()=>{
    const app = express()

    await connectToDB();

    await App(app)

    app.listen(process.env.PORT,()=>{
        console.log(`server start on port ${process.env.PORT}`)
    });
    
}

StartServer()
