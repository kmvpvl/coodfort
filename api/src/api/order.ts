import { Context } from 'openapi-backend';
import { Request, Response } from 'express';
import { DocumentError } from '../model/protodocument';
import { DocumentErrorCode, Types } from '../types/prototypes';
import { User } from '../model/user';
import { Eatery, Order } from '../model/eatery';
import { EateryRoleCode } from '../types/eaterytypes';
import { IOrder } from '../types/ordertypes';

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
        if (req.body.orderId === undefined) {
            throw new DocumentError(DocumentErrorCode.parameter_expected, `OrderItem id expected`);
        }
        if (req.body.itemIds === undefined) {
            throw new DocumentError(DocumentErrorCode.parameter_expected, `OrderItem order_id expected`);
        }
        const ids: (Types.ObjectId | undefined)[] = req.body.itemIds;

        const order = new Order(req.body.orderId);
        await order.load();

        order.data.items.forEach((item, idx) => {
            if (ids.includes(item.id)) order.wfRelatedNext('items', idx, user);
        });
        return res.status(200).json({ ok: true, order: order.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function eateryOrderList(c: Context, req: Request, res: Response, user: User) {
    try {
        if (req.body.id === undefined) {
            throw new DocumentError(DocumentErrorCode.parameter_expected, `Eatery id expected`);
        }

        const eatery = new Eatery(req.body.id);
        await eatery.load();
        if (!eatery.checkRoles(EateryRoleCode['sous-chef'], user.id)) return res.status(403).json({ ok: false, code: DocumentErrorCode.role_required, message: `Role 'sous-chef' is required` });

        const order = new Order();
        await order.getCollection('`eateryId`=?', [req.body.id], '`created` DESC');
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
