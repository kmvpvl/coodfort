import { Context } from 'openapi-backend';
import { Request, Response } from 'express';
import { DocumentError } from '../model/protodocument';
import { DocumentErrorCode, IWfNextRequest, Types, WorkflowStatusCode } from '../types/prototypes';
import { User } from '../model/user';
import { Eatery, Order, OrderItem, Payment } from '../model/eatery';
import { EateryRoleCode } from '../types/eaterytypes';
import { IOrder, IOrderItem } from '../types/ordertypes';
import { error } from 'console';

export async function newOrder(c: Context, req: Request, res: Response, user: User) {
    try {
        const order = new Order();
        if (req.body.id === undefined) {
            req.body.userId = user.id;
        }
        order.checkMandatory(req.body);
        await order.load(req.body);
        await order.save(user.data.login);
        return res.status(200).json({ ok: true, order: order.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function updateOrderItem(c: Context, req: Request, res: Response, user: User) {
    try {
        const orderItem = new OrderItem();
        if (req.body.order_id === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Order item MUST get filled order_id field`);
        const parentOrder = new Order(req.body.order_id);
        await parentOrder.load();
        const eatery = new Eatery(parentOrder.data.eateryId);
        await eatery.load();
        orderItem.checkMandatory(req.body);
        await orderItem.load(req.body);
        if (req.body.id === undefined) {
            if (user.id !== parentOrder.data.userId && !eatery.checkRoles(EateryRoleCode['sous-chef'], user.id)) return res.status(403).json({ ok: false, error: { message: `Order item must create guest or eatery staff with role 'sous-chef'` } });
        } else {
            const oldItem = parentOrder.data.items.filter(item => item.id == req.body.id);
            if (oldItem.length !== 1) return res.status(400).json({ ok: false, error: { message: `Order item with id = '${req.body.id}' not found` } });
            if (oldItem[0].wfStatus !== orderItem.data.wfStatus) return res.status(400).json({ ok: false, error: { message: `Order item with id = '${req.body.id}' has different wfStatus` } });
            if (oldItem[0].wfStatus === WorkflowStatusCode.draft && user.id !== parentOrder.data.userId && !eatery.checkRoles(EateryRoleCode['sous-chef'], user.id))
                return res.status(403).json({ ok: false, error: { message: `Order item must create guest or eatery staff with role 'sous-chef'` } });
            if (oldItem[0].wfStatus !== WorkflowStatusCode.draft && !eatery.checkRoles(EateryRoleCode['sous-chef'], user.id)) return res.status(403).json({ ok: false, error: { message: `Order item must create guest or eatery staff with role 'sous-chef'` } });
        }
        if (orderItem.data.count === 0) await orderItem.delete();
        else await orderItem.save(user.data.login);
        await parentOrder.load();
        return res.status(200).json({ ok: true, order: parentOrder.data });
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

export async function wfNextOrder(c: Context, req: Request, res: Response, user: User) {
    try {
        if (req.body.id === undefined) {
            throw new DocumentError(DocumentErrorCode.parameter_expected, `Order id expected`);
        }
        const order = new Order(req.body.id);
        await order.load();
        const eatery = new Eatery(order.data.eateryId);
        await eatery.load();
        if (order.data.wfStatus === WorkflowStatusCode.draft && eatery.checkRoles(EateryRoleCode['payment-get'], user.id)) order.wfNext(user, req.body.nextWfStatus);
        return res.status(200).json({ ok: true, order: order.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function wfNextOrderItem(c: Context, req: Request, res: Response, user: User) {
    try {
        if (req.body.orderItemId === undefined) {
            throw new DocumentError(DocumentErrorCode.parameter_expected, `{orderItemId, nextWFStatus} expected`);
        }
        const id: IWfNextRequest = req.body.orderItemId;

        let eatery: Eatery | undefined;
        let order: Order | undefined;

        const item = new OrderItem(id.id);
        await item.load();
        if (item.data.order_id !== undefined) {
            if (order === undefined || order.id !== item.data.order_id) {
                order = new Order(item.data.order_id);
                await order.load();
            }
            if (eatery === undefined || eatery.id !== order.data.eateryId) {
                eatery = new Eatery(order.data.eateryId);
                await eatery.load();
            }
            if (order.data.wfStatus === WorkflowStatusCode.draft) {
                if (eatery.data.approveRequiredToReserve) {
                    throw new DocumentError(DocumentErrorCode.wf_suspense, `Parent order id = '${order.id}' of order item id = '${item.id}' has draft status yet`);
                }
            }
            if (
                //guest rights check
                ((item.data.wfStatus === WorkflowStatusCode.draft || item.data.wfStatus === WorkflowStatusCode.done) && order.data.userId === user.id) ||
                // eatery staff rights check
                ((item.data.wfStatus === WorkflowStatusCode.registered || item.data.wfStatus === WorkflowStatusCode.approved) && eatery?.checkRoles(EateryRoleCode['sous-chef'], user.id))
            )
                await item.wfNext(user, id.nextWfStatus);
            else res.status(403).json({ ok: false, error: { message: `Only geust or eatery staff with role 'sous-chef' could change state` } });
        } else {
            throw new DocumentError(DocumentErrorCode.wf_suspense, `Order item id = '${item.id}' MUST have non-null order_id`);
        }
        await order.load();
        return res.status(200).json({ ok: true, order: order.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function wfNextOrderItems(c: Context, req: Request, res: Response, user: User) {
    try {
        if (req.body.orderItemIds === undefined) {
            throw new DocumentError(DocumentErrorCode.parameter_expected, `Array of {orderItemId, nextWFStatus} expected`);
        }
        const ids: IWfNextRequest[] = req.body.orderItemIds;

        const ret: IOrderItem[] = [];
        let eatery: Eatery | undefined;
        let order: Order | undefined;

        for (let idx = 0; idx < ids.length; idx++) {
            const item = new OrderItem(ids[idx].id);
            await item.load();
            if (item.data.order_id !== undefined) {
                if (order === undefined || order.id !== item.data.order_id) {
                    order = new Order(item.data.order_id);
                    await order.load();
                }
                if (eatery === undefined || eatery.id !== order.data.eateryId) {
                    eatery = new Eatery(order.data.eateryId);
                    await eatery.load();
                }
                if (order.data.wfStatus === WorkflowStatusCode.draft) {
                    if (eatery.data.approveRequiredToReserve) {
                        ret.push(item.data);
                        continue;
                    }
                }
                if (
                    //guest rights check
                    ((item.data.wfStatus === WorkflowStatusCode.draft || item.data.wfStatus === WorkflowStatusCode.done) && order.data.userId === user.id) ||
                    // eatery staff rights check
                    ((item.data.wfStatus === WorkflowStatusCode.registered || item.data.wfStatus === WorkflowStatusCode.approved) && eatery?.checkRoles(EateryRoleCode['sous-chef'], user.id))
                )
                    await item.wfNext(user, ids[idx].nextWfStatus);
                //???else res.status(403).json();
                ret.push(item.data);
            } else {
                throw new DocumentError(DocumentErrorCode.wf_suspense, `Order item id = '${item.id}' MUST have non-null order_id`);
            }
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
            const order = new Order(orderId.id);
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
