import { RowDataPacket } from 'mysql2/promise';
import { IDocument, Types } from './prototypes';

export type ITag = Types.IMLString;

export interface ITimeSlot {
    start: Date;
    duration: number;
    repeat?: string;
    until?: Date;
    includes?: ITimeSlot[];
    excludes?: ITimeSlot[];
}

export interface IPhoto {
    url: string;
    caption?: Types.IMLString;
    tags?: ITag[];
}

export interface IRating {
    ratingValue: number;
    ratingCount: number;
}

export interface IAward {
    awardName: Types.IMLString;
    logo?: {
        url: string;
        caption: Types.IMLString;
    };
    url: string;
}
export enum EateryRoleCode {
    'supervisor' = 'supervisor',
    'owner' = 'owner',
    'MDM' = 'MDM',
}
export interface ITable extends IDocument {
    name: Types.IMLString;
    tags: ITag[];
    photos?: IPhoto[];
    guestCountMax?: number;
    guestCountMin?: number;
    timeSlots?: ITimeSlot[];
}
export interface IEatery extends IDocument {
    name: Types.IMLString;
    employees: {
        employeeId: Types.ObjectId;
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
    photos?: IPhoto[];
    description?: Types.IMLString;
    tags?: ITag[];
    cuisines?: Types.IMLString[];
    averageBills?: { cuisine: Types.IMLString; withAlcohol: number; withoutAlcohol: number }[];
    menuId?: Types.ObjectId;
}
export interface IEateryBrief extends RowDataPacket {}
export interface IEateryBrief extends IEatery {
    roles: string;
}

export interface IMealRow extends RowDataPacket {}
export interface IMealRow extends IMeal {}

export interface IEmployee extends IDocument {
    login: number | string /**Telegram ID or login or phone */;
    hash: string /** */;
    name?: string;
    rating?: IRating;
    awards?: IAward[];
    photos?: IPhoto[];
    bios?: Types.MLString[];
    tags?: ITag[];
}
interface IBooking extends IDocument {
    eateryId: Types.ObjectId;
    mnemNumber: string;
    mainGuestId: Types.ObjectId;
    whoPaysGuestId: Types.ObjectId[];
    guestIds: Types.ObjectId[];
    tableIds: Types.ObjectId[];
    timeSlot: ITimeSlot;
}
interface IGuest extends IDocument {}
interface IOrder extends IDocument {}
interface IEntertainment extends IDocument {}
interface IDeliveryPartner extends IDocument {}
interface IInvoice extends IDocument {}
interface IPayment extends IDocument {}
export interface IMealVolumeOption {
    volume: Types.IMLString;
    amount: number;
    currency: Types.IMLString;
    includeOptions?: IMealVolumeOption[];
    excludeOptions?: IMealVolumeOption[];
}

export interface IMeal extends IDocument {
    name: Types.IMLString;
    employeeId?: Types.ObjectId;
    eateryId?: Types.ObjectId;
    description: Types.IMLString;
    photos: IPhoto[];
    options: IMealVolumeOption[];
    tags?: ITag[];
}

export interface IMenuItem extends IMeal {
    mealId?: Types.ObjectId;
    restrictions?: Types.IMLString[];
    rating?: IRating;
    awards?: IAward[];
}

export interface IMenuChapter {
    name: Types.IMLString;
    description: Types.IMLString;
    items: IMenuItem[];
    headerHtml: Types.IMLString;
    footerHtml: Types.IMLString;
    restrictions?: Types.IMLString[];
}

export interface IMenu extends IDocument {
    employeeId?: Types.ObjectId;
    name: string;
    headerHtml: Types.IMLString;
    footerHtml: Types.IMLString;
    restrictions?: Types.IMLString[];
    chapters: IMenuChapter[];
}
