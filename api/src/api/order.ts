import { Context } from 'openapi-backend';
import { Request, Response } from 'express';
import { DocumentError } from '../model/protodocument';
import { Meal, Menu } from '../model/meal';
import { DocumentErrorCode } from '../types/prototypes';
import { User } from '../model/user';
import { Order } from '../model/eatery';

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
            throw new DocumentError(DocumentErrorCode.parameter_expected, `Meal id expected`);
        }
        const order = new Order(req.body.id);
        await order.load();
        return res.status(200).json({ ok: true, order: order.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}
