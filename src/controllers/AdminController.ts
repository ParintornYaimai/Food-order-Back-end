import { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto/Vandor.dto";
import { DeliveryUser, Transaction, Vandor } from "../models";
import {
  ResponseSuccess,
  ResponseError,
  ResponseServerError,
} from "../response/index";
import bcrypt from "bcrypt";

export const CreateVandor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    address,
    pincode,
    foodType,
    email,
    password,
    ownerName,
    phone,
  } = <CreateVandorInput>req.body;

  try {
    const existingVandor = await Vandor.findOne({ email });

    if (existingVandor) {
      return ResponseError(res, "Email not available");
    }

    const EncryptPassword = await bcrypt.hash(password, 10);

    const createdVandor = await Vandor.create({
      name: name,
      address: address,
      pincode: pincode,
      foodType: foodType,
      email: email,
      password: EncryptPassword,
      salt: "UaF6qMiDcpaQJoq7FqGO",
      ownerName: ownerName,
      phone: phone,
      serviceAvailable: false,
      coverImages: [],
      foods: [],
      lat: 0,
      lng: 0,
    });

    if (createdVandor) {
      ResponseSuccess(res, createdVandor);
    } else {
      ResponseError(res);
    }
  } catch (error) {
    ResponseServerError(res);
  }
};

export const GetVandor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendors = await Vandor.find();
    if (vendors !== null) {
      return ResponseSuccess(res, vendors);
    }

    ResponseError(res);
  } catch (error) {
    ResponseError(res);
  }
};

export const GetVandorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  try {
    const vandorsId = await Vandor.findById(id);
    if (vandorsId) {
      return ResponseSuccess(res, vandorsId);
    }

    ResponseError(res);
  } catch (error) {
    console.log("GetVandorById", error);
    ResponseError(res);
  }
};

export const GetTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactions = await Transaction.find();

    if (transactions) {
      return ResponseSuccess(res, transactions, "Transactions not availabe!");
    }

    ResponseError(res);
  } catch (error) {
    console.log("GetVandorById", error);
    ResponseError(res);
  }
};

export const GetTransactionsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  try {
    const transactions = await Transaction.findById(id);

    if (transactions) {
      return ResponseSuccess(res, transactions);
    }

    ResponseError(res);
  } catch (error) {
    console.log("GetVandorById", error);
    ResponseError(res);
  }
};

export const VerifyDeliveryUser = async (req: Request, res: Response) => {
  const { _id, status } = req.body;

  try {
    if (_id) {
      const profile = await DeliveryUser.findById(_id);

      if (profile) {
        profile.verified = status;

        const result = await profile.save();
        return ResponseSuccess(res, result);
      }
    }

    ResponseError(res);
  } catch (error) {
    ResponseServerError(res);
  }
};

export const GetDeliveryUser = async (req: Request, res: Response) => {

  try {
    const profile = await DeliveryUser.find();

    if (profile) {
      return ResponseSuccess(res, profile);
    }
    
    ResponseError(res);
  } catch (error) {
    ResponseServerError(res);
  }
};
