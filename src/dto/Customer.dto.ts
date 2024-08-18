import { IsEmail, isEmpty, IsEmpty, Length } from "class-validator"

export class CreateCustomerInputs {

    @IsEmail()
    email: string;

    @Length(7, 12)
    phone: string;

    @Length(6, 12)
    password: string;
}


export interface CustomerPayload{
    _id: string,
    email: string,
    verified: boolean,
}

export class UserLoginInputs{
    
    @IsEmail()
    email: string;

    @Length(6, 12)
    password: string;
}

export interface CustomerDoc{
    _id: any;
    email: string;
    password: string;
    salt: string;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    verified: boolean;
    otp: number;
    otp_expiry: Date;
    lat: number;
    lng: number;

}

export class EditCustomerProfileInputs{
    @Length(3, 12)
    firstName: string;

    @Length(3, 12)
    lastName: string;

    @Length(6, 12)
    address: string;

}

export class CartItems{
    _id: string;
    unit: number;
}

export class OrdersInputs {

    txnId: string;
    amount: string;
    items: [CartItems];
}


export class CreateDeliveryUserInputs {

    @IsEmail()
    email: string;

    @Length(7, 12)
    phone: string;

    @Length(6, 12)
    password: string;

    @Length(6, 12)
    firstName: string;

    @Length(6, 12)
    lastName: string;

    @Length(6, 24)
    address: string;

    @Length(6, 24)
    pincode: string;
}
