import { Context } from 'openapi-backend';
import { Request, Response } from 'express';
import { Eatery, Employee, TableCallWaiterSignal } from '../model/eatery';
import { IEatery } from '../types/eaterytypes';
import { EateryRoleCode } from '../types/eaterytypes';
import { DocumentError } from '../model/protodocument';
import { DocumentErrorCode } from '../types/prototypes';
import { Types } from '../types/prototypes';
import { User } from '../model/user';
import { ITableCallWaiterSignal } from '../types/ordertypes';

function eateryDataFromBody(req: Request): IEatery {
    if (req.body.name === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Parameter 'name' is mandatory`);

    const eateryData: IEatery = req.body;
    eateryData.employees = [];
    return eateryData;
}

export async function newEatery(c: Context, req: Request, res: Response, user: User) {
    try {
        const eatery = await user.createEatery(eateryDataFromBody(req));
        return res.status(200).json({ ok: true, eatery: eatery?.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function addEateryEmployee(c: Context, req: Request, res: Response, user: User) {
    try {
        const eateryId = req.body.eatery_id as Types.ObjectId;
        const eatery = new Eatery(eateryId);
        await eatery.load();

        if (!eatery.checkRoles(EateryRoleCode.owner, user.id)) return res.status(403).json({ ok: false, error: { message: 'Unauthorized user' } });
        const empl = new Employee(req.body);
        await empl.save(user.data.login);
        await eatery.load();
        return res.status(200).json({ ok: true, eatery: eatery.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function updateEatery(c: Context, req: Request, res: Response, user: User) {
    try {
        if (req.body.id === undefined) return newEatery(c, req, res, user);
        const ed = eateryDataFromBody(req);
        ed.id = req.body.id as Types.ObjectId;
        const eatery = new Eatery(ed.id);
        await eatery.load();

        if (!eatery.checkRoles(EateryRoleCode.MDM, user.id)) return res.status(403).json({ ok: false, error: { message: 'Unauthorized user' } });
        for (const [prop, val] of Object.entries(ed)) {
            if (prop !== 'employees') (eatery.data as any)[prop] = val;
        }
        await eatery.save(user.data.login);
        return res.status(200).json({ ok: true, eatery: eatery.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function viewEatery(c: Context, req: Request, res: Response, user: User) {
    const id = parseInt(req.body.id);
    if (isNaN(id))
        return res.status(400).json({
            ok: false,
            error: new DocumentError(DocumentErrorCode.parameter_expected, `Parameter 'id' is mandatory`).json,
        });
    try {
        const eatery = new Eatery(id);
        await eatery.load();
        if (-1 === eatery.data.employees.findIndex(empl => empl.userId === user.id)) eatery.data.employees = [];
        return res.status(200).json({ ok: true, eatery: eatery.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function publishEatery(c: Context, req: Request, res: Response, user: User) {
    try {
        if (req.body.id === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Parameter 'id' is mandatory`);
        const id = req.body.id as Types.ObjectId;
        const eatery = new Eatery(id);
        await eatery.load();

        if (!eatery.checkRoles(EateryRoleCode.MDM, user.id)) return res.status(403).json({ ok: false, error: { message: 'Unauthorized user' } });
        await eatery.wfNext(user);
        return res.status(200).json({ ok: true, eatery: eatery.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function callWaiter(c: Context, req: Request, res: Response, user: User) {
    try {
        const signal = new TableCallWaiterSignal({ ...req.body, userId: user.id });
        await signal.save(user.data.login);
        return res.status(200).json({ ok: true, tableCallWaiterSignal: signal.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function tableCallWaiterSignalsList(c: Context, req: Request, res: Response, user: User) {
    try {
        const ret: ITableCallWaiterSignal[] = [];
        const signal = new TableCallWaiterSignal();
        for (const tableId of req.body.tableIds) {
            await signal.getCollection('`tableId` = ?', [tableId], '`created` DESC', 1);
            if (signal.collection.length === 1) {
                const s = new TableCallWaiterSignal(signal.collection[0]);
                await s.load();
                ret.push(s.data);
            }
        }
        return res.status(200).json({ ok: true, tableCallWaiterSignals: ret });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}
