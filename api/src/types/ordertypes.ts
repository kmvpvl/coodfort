import { IDocument } from './prototypes';

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
