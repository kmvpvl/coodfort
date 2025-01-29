import { Context } from 'openapi-backend';
import { Request, Response } from 'express';
import { DocumentError } from '../model/protodocument';
import { DocumentErrorCode, IWfNextRequest, Types, WorkflowStatusCode } from '../types/prototypes';
import { User } from '../model/user';
import { Eatery, Order, OrderItem, Payment } from '../model/eatery';
import { EateryRoleCode } from '../types/eaterytypes';
import { IOrder, IOrderItem } from '../types/ordertypes';

export async function updateOrder(c: Context, req: Request, res: Response, user: User) {
    try {
        const order = new Order();
        if (req.body.id === undefined) {
            req.body.userId = user.id;
        } else {
            const tempOrder = new Order(req.body.id);
            await tempOrder.load();
            if (tempOrder.data.userId !== user.id) return res.status(403).json({ ok: false, error: `` });
        }
        order.checkMandatory(req.body);
        await order.load(req.body);
        await order.save(user.data.login.toString());
        return res.status(200).json({ ok: true, order: order.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function viewOrder(c: Context, req: Request, res: Response, user: User) {
    try {
        if (req.body.id === undefined) {
            throw new DocumentError(DocumentErrorCode.parameter_expected, `Order id expected`);
        }
        const order = new Order(req.body.id);
        await order.load();
        return res.status(200).json({ ok: true, order: order.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function wfNextOrderItem(c: Context, req: Request, res: Response, user: User) {
    try {
        if (req.body.orderItemIds === undefined) {
            throw new DocumentError(DocumentErrorCode.parameter_expected, `Array of {orderItemId, nextWFStatus} expected`);
        }
        const ids: IWfNextRequest[] = req.body.orderItemIds;

        const ret: IOrderItem[] = [];

        for (let idx = 0; idx < ids.length; idx++) {
            const item = new OrderItem(ids[idx].id);
            await item.load();
            await item.wfNext(user, ids[idx].nextWfStatus);
            ret.push(item.data);
        }
        return res.status(200).json({ ok: true, orderItems: ret });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function eateryOrderList(c: Context, req: Request, res: Response, user: User) {
    try {
        if (req.body.eateryId === undefined) {
            throw new DocumentError(DocumentErrorCode.parameter_expected, `Eatery id expected`);
        }

        const eatery = new Eatery(req.body.eateryId);
        const wfStatuses: WorkflowStatusCode[] = req.body.wfStatuses;
        await eatery.load();
        if (!eatery.checkRoles(EateryRoleCode['sous-chef'], user.id)) return res.status(403).json({ ok: false, code: DocumentErrorCode.role_required, message: `Role 'sous-chef' is required` });

        const order = new Order();
        await order.getCollection(`\`eateryId\` = ? ${wfStatuses !== undefined && wfStatuses.length > 0 ? `AND ( ${wfStatuses.map(status => '`wfStatus` = ? ').join(' OR ')} )` : ''}`, [req.body.eateryId, ...wfStatuses], '`created` DESC');
        const ret: IOrder[] = [];
        for (const orderId of order.collection) {
            const order = new Order(orderId);
            await order.load();
            ret.push(order.data);
        }
        return res.status(200).json({ ok: true, orders: ret });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function newPayment(c: Context, req: Request, res: Response, user: User) {
    try {
        if (req.body.order_id === undefined) {
            throw new DocumentError(DocumentErrorCode.parameter_expected, `order_id expected`);
        }
        const order = new Order(req.body.order_id);
        await order.load();
        if (order.data.eateryId !== undefined) {
            const eatery = new Eatery(order.data.eateryId);
            await eatery.load();
            if (!eatery.checkRoles(EateryRoleCode['payment-get'], user.id)) return res.status(403).json({ ok: false, code: DocumentErrorCode.role_required, message: `Role 'payment-get' is required` });

            const payment = new Payment(req.body);
            await payment.save();

            await order.load();
        }
        return res.status(200).json({ ok: true, order: order.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}
