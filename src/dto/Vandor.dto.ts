export interface CreateVandorInput{
    name: string;
    ownerName: string;
    foodType: string[];
    pincode: string;
    address: string;
    phone: string;
    email: string;
    password: string;
}
export interface EditVandorInputs{
    name: string;
    address: string;
    phone: string;
    foodType: [string];
}

export interface VandorLogintype{
    email: string;
    password: string;
}

export interface vandorPayload{
    _id: any;
    email: string;
    name: string;
}

export interface CreateOfferInputs{
    offerType: string;
    vandors: [any];
    title: string;
    description: string;
    minValue: number;
    offerAmount: number;
    startValidity: Date;
    endValidity: Date;
    promocode: string;
    promoType: string;
    bank: [any];
    bins: [any];
    pincode: string;
    isActive: boolean;
}