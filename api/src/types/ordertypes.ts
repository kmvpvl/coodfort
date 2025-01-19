import { IMeal, IMealOption } from './eaterytypes';
import { IDocument, Types } from './prototypes';

export enum OrderFunelStages {
    booking,
    collectMeals,
    approveGuest,
    approveEatery,
    fulfillment,
    payment,
    feedback,
}

export interface IOrderItem extends IMeal {
    option: IMealOption;
    count: number;
    comment?: string;
}

export interface IOrder extends IDocument {
    userId?: Types.ObjectId;
    eateryId?: Types.ObjectId;
    tableId?: Types.ObjectId;
    items: IOrderItem[];
    discount: number;
    comment?: string;
    esId?: string;
}
