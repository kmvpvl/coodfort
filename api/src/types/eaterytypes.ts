import { RowDataPacket } from 'mysql2/promise';
import { ICoords, IDocument, IPhoto, ITag, ITimeSlot, Types } from './prototypes';
import { IUser } from './prototypes';
import { IOrder } from './ordertypes';

export interface IEmployee extends IUser {}
export enum EateryRoleCode {
    'supervisor' = 'supervisor',
    'owner' = 'owner',
    'MDM' = 'MDM',
    'sous-chef' = 'sous-chef',
    'payment-get' = 'payment-get',
}
export interface ITable extends IDocument {
    name: Types.IMLString;
    tags: ITag[];
    photos?: IPhoto[];
    guestCountMax?: number;
    guestCountMin?: number;
    timeSlots?: ITimeSlot[];
    esId?: string;
    approveRequiredToReserve?: boolean;
}
export interface IEatery extends IDocument {
    name: Types.IMLString;
    employees: {
        userId: Types.ObjectId;
        roles: EateryRoleCode;
        objects?: {
            type: string;
            id: Types.ObjectId;
        }[];
    }[];
    tables: ITable[];
    deliveryPartnerIds: Types.ObjectId[];
    entertainmentIds: Types.ObjectId[];
    url?: { url: string; caption: Types.IMLString };
    coords?: ICoords;
    photos?: IPhoto[];
    description?: Types.IMLString;
    tags?: ITag[];
    cuisines?: Types.IMLString[];
    averageBills?: { cuisine: Types.IMLString; withAlcohol: number; withoutAlcohol: number }[];
    menuId?: Types.ObjectId;
    esId?: string;
    tableRequiredToInhouseOrder?: boolean;
    approveRequiredToReserve?: boolean;
}
export interface IEateryBrief extends RowDataPacket {}
export interface IEateryBrief extends IEatery {
    roles: string;
}

export interface IMealRow extends RowDataPacket {}
export interface IMealRow extends IMeal {}

export interface IMenuRow extends RowDataPacket {}
export interface IMenuRow extends IMenu {}

export interface IOrderRow extends RowDataPacket {}
export interface IOrderRow extends IOrder {}

interface IBooking extends IDocument {
    eateryId: Types.ObjectId;
    mnemNumber: string;
    mainGuestId: Types.ObjectId;
    whoPaysGuestId: Types.ObjectId[];
    guestIds: Types.ObjectId[];
    tableIds: Types.ObjectId[];
    timeSlot: ITimeSlot;
}
interface IEntertainment extends IDocument {}
interface IDeliveryPartner extends IDocument {}
export interface IMealOption {
    name: Types.IMLString;
    amount: number;
    currency: Types.IMLString;
    includeOptions?: IMealOption[];
    excludeOptions?: IMealOption[];
    esId?: string;
}

export interface IMealRequisites {
    name: Types.IMLString;
    description: Types.IMLString;
    tags?: ITag[];
}

export interface IMeal extends IMealRequisites {}
export interface IMeal extends IDocument {
    userId?: Types.ObjectId;
    eateryId?: Types.ObjectId;
    photos: IPhoto[];
    esId?: string;
}

export interface IMenuItem {
    mealId?: Types.ObjectId;
    options: IMealOption[];
    restrictions?: Types.IMLString[];
}

export interface IMenuChapter {
    items: IMenuItem[];
    iconUrl?: string;
    name: Types.IMLString;
    headerHtml?: Types.IMLString;
    footerHtml?: Types.IMLString;
    restrictions?: Types.IMLString;
}

export interface IMenu extends IDocument {
    userId?: Types.ObjectId;
    name: string;
    headerHtml: Types.IMLString;
    footerHtml: Types.IMLString;
    restrictions?: Types.IMLString[];
    chapters: IMenuChapter[];
}
