import express, { Request, Response, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
dotenv.config();

//import route
import { AdminRoute, VandorRoute, CustomerRoute, ShoppingRoute, Delivery} from "../routes";
import { connectToDB } from "../config/index";

export default async (app: Application) => {
  //middleware
  app.use(
    cors({
      origin: "http://localhost:5500",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/image", express.static(path.join(__dirname, "image")));

  //routes
  app.use("/admin", AdminRoute);
  app.use("/vandor", VandorRoute);
  app.use("/customer", CustomerRoute);
  app.use("/shopping",ShoppingRoute);
  app.use("/Delivery",Delivery)

};

