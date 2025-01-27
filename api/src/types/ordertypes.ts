import { IMeal, IMealOption, IMealRequisites } from './eaterytypes';
import { IDocument, Types, WorkflowStatusCode } from './prototypes';

export interface IOrderItem extends IDocument {}
export interface IOrderItem extends IMealRequisites {
    order_id: Types.ObjectId;
    option: IMealOption;
    count: number;
    comment?: string;
}

export interface IOrder extends IDocument {
    userId?: Types.ObjectId;
    eateryId?: Types.ObjectId;
    tableId?: Types.ObjectId;
    items: IOrderItem[];
    payments: IPayment[];
    discount: number;
    comment?: string;
    esId?: string;
}
export interface IOrderSumBalance {
    payed: number;
    draftSum: number;
    draftCount: number;
    registeredSum: number;
    approvedByEaterySum: number;
    fulfilledSum: number;
}

export interface ITableCallWaiterSignal extends IDocument {
    tableId: Types.ObjectId;
    on: boolean;
    userId?: Types.ObjectId;
}

export enum PaymentMethod {
    cash,
    card,
}

export interface IPayment extends IDocument {
    order_id: Types.ObjectId;
    amount: number;
    currency?: string;
    paymentMethod: PaymentMethod;
    comment?: string;
    esId?: string;
}

interface IInvoice extends IDocument {}
