import { IDocument, IPhoto, ITag, Types } from './prototypes';

export interface IGuest extends IDocument {
    login: number | string /**Telegram ID or login or phone */;
    hash: string /** */;
    name?: string;
    photos?: IPhoto[];
    bios?: Types.MLString[];
    tags?: ITag[];
}

export enum OrderFunelStages {
    booking,
    collectMeals,
    approveGuest,
    approveEatery,
    fulfillment,
    payment,
    feedback,
}
export interface IOrder extends IDocument {}
