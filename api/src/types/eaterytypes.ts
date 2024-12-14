import { IDocument, Types } from './prototypes';

export interface ITimeSlot {}

export interface IPhoto {
    url: string;
    caption?: Types.IMLString;
    tags?: Types.IMLString[];
}

export interface IRating {
    ratingValue: number;
    ratingCount: number;
}

export interface IAward {
    awardName: Types.IMLString;
    logo?: {
        url?: string;
        html?: Types.IMLString;
    };
    url: string;
}
export enum EateryRoleCode {
    'supervisor' = 'supervisor',
    'administrator' = 'administrator',
    'MDM' = 'MDM',
}
export interface ITable extends IDocument {
    name: Types.IMLString;
    guestCountMax?: number;
    guestCountComfort?: number;
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
    rating?: IRating;
    urls?: { url: string; caption: Types.IMLString }[];
    photos?: IPhoto[];
    descriptions?: { url?: string; html: Types.IMLString }[];
    tags?: Types.IMLString[];
    awards?: IAward[];
    cuisines?: Types.IMLString[];
    averageBills?: { cuisine: Types.IMLString; withAlcohol: number; withoutAlcohol: number }[];
    menuId?: Types.ObjectId;
}
export interface IEmployee extends IDocument {
    login: number | string /**Telegram ID or login or phone */;
    hash: string /** */;
    name?: string;
    rating?: IRating;
    awards?: IAward[];
    photos?: IPhoto[];
    bios?: Types.MLString[];
    tags?: Types.MLString[];
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
    name: string;
    eateryAuthorId?: Types.ObjectId;
    description: Types.IMLString;
    photos: IPhoto[];
    options: IMealVolumeOption[];
    tags?: Types.MLString[];
}

export interface IMenuItem extends IMeal {
    headerHtml?: Types.IMLString;
    footerHtml?: Types.IMLString;
    notesHtml?: Types.IMLString;
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
    notesHtml: Types.IMLString;
    restrictions?: Types.IMLString[];
}

export interface IMenu extends IDocument {
    eateryAuthorId?: Types.ObjectId;
    headerHtml: Types.IMLString;
    footerHtml: Types.IMLString;
    notesHtml: Types.IMLString;
    restrictions?: Types.IMLString[];
    chapters: IMenuChapter[];
}
