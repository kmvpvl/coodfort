import { Context } from 'openapi-backend';
import { AuthUser } from '../model/security';
import { Request, Response } from 'express';
import { Eatery } from '../model/eatery';
import { IEatery } from '../types/eaterytypes';
import { EateryRoleCode } from '../types/eaterytypes';
import { DocumentError } from '../model/protodocument';
import { DocumentErrorCode } from '../types/prototypes';
import { Types } from '../types/prototypes';

function eateryDataFromBody(req: Request): IEatery {
    if (req.body.name === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Parameter 'name' is mandatory`);
    const eateryData: IEatery = {
        name: req.body.name,
        tables: req.body.tables ? req.body.tables : [],
        employees: [],
        deliveryPartnerIds: [],
        entertainmentIds: [],

        description: req.body.description,
        url: req.body.url,
        cuisines: req.body.cuisines,
        averageBills: req.body.averageBills,
        photos: req.body.photos,
        tags: req.body.tags,
    };
    return eateryData;
}

export async function newEatery(c: Context, req: Request, res: Response, user: AuthUser) {
    try {
        const eatery = await user.employee?.createEatery(eateryDataFromBody(req));
        return res.status(200).json({ ok: true, eatery: eatery?.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: e });
    }
}

export async function updateEatery(c: Context, req: Request, res: Response, user: AuthUser) {
    try {
        if (req.body.id === undefined) return newEatery(c, req, res, user);
        const ed = eateryDataFromBody(req);
        ed.id = req.body.id as Types.ObjectId;
        const eatery = new Eatery(ed.id);
        await eatery.load();

        if (user.employee !== undefined && !eatery.checkRoles(EateryRoleCode.MDM, user.employee.id)) return res.status(403).json({ ok: false, error: { message: 'Unauthorized user' } });
        for (const [prop, val] of Object.entries(ed)) {
            if (prop !== 'employees') (eatery.data as any)[prop] = val;
        }
        await eatery.save(user.employee?.data.login.toString());
        return res.status(200).json({ ok: true, eatery: eatery.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: e });
    }
}

export async function viewEatery(c: Context, req: Request, res: Response, user: AuthUser) {
    const id = parseInt(req.body.id);
    if (isNaN(id))
        return res.status(400).json({
            ok: false,
            error: new DocumentError(DocumentErrorCode.parameter_expected, `Parameter 'id' is mandatory`).json,
        });
    try {
        const eatery = new Eatery(id);
        await eatery.load();
        if (-1 === eatery.data.employees.findIndex(empl => empl.employeeId === user.employee?.id)) eatery.data.employees = [];
        return res.status(200).json({ ok: true, eatery: eatery.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: e });
    }
}

export async function publishEatery(c: Context, req: Request, res: Response, user: AuthUser) {
    try {
        if (req.body.id === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Parameter 'id' is mandatory`);
        const id = req.body.id as Types.ObjectId;
        const eatery = new Eatery(id);
        await eatery.load();

        if (user.employee !== undefined && !eatery.checkRoles(EateryRoleCode.MDM, user.employee.id)) return res.status(403).json({ ok: false, error: { message: 'Unauthorized user' } });
        if (user.employee !== undefined) await eatery.wfNext(user.employee);
        return res.status(200).json({ ok: true, eatery: eatery.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: e });
    }
}
