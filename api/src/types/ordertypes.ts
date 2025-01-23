import { IMeal, IMealOption, IMealRequisites } from './eaterytypes';
import { IDocument, Types, WorkflowStatusCode } from './prototypes';

export interface IOrderItem extends IDocument {}
export interface IOrderItem extends IMealRequisites {
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
export enum OrderFunelStages {
    collectingMeal = WorkflowStatusCode.draft,
    approvedGuest = WorkflowStatusCode.registered,
    approvedEatery = WorkflowStatusCode.approved,
    fulfilled = WorkflowStatusCode.done,
    payed = WorkflowStatusCode.payed,
    feedback = WorkflowStatusCode.review,
    closed = WorkflowStatusCode.closed,
}
