import { Context } from 'openapi-backend';
import { Request, Response } from 'express';
import { Eatery } from '../model/eatery';
import { IEatery } from '../types/eaterytypes';
import { EateryRoleCode } from '../types/eaterytypes';
import { DocumentError } from '../model/protodocument';
import { DocumentErrorCode } from '../types/prototypes';
import { Types } from '../types/prototypes';
import { User } from '../model/user';

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
        await eatery.save(user.data.login.toString());
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
