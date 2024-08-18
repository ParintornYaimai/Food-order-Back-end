import { vandorPayload } from "./Vandor.dto";
import {CustomerPayload} from "./Customer.dto"

export type AuthPayload = vandorPayload | CustomerPayload;
