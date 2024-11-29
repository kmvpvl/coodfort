import { Context } from "openapi-backend";
import { AuthUser } from "../model/security";
import { Request, Response } from "express";
import { IEatery } from "../model/eateries";
import { DocumentError, DocumentErrorCode } from "../model/sqlproto";


export async function newEatery(c: Context, req: Request, res: Response, user: AuthUser) {
    try {
        if (req.body.name === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Parameter Name is mandatory`);
        const eateryData: IEatery = {
            name: req.body.name,
            employees: [],
            tables: [],
            deliveryPartnerIds: [],
            entertainmentIds: [],
            description: req.body.description,
            url: req.body.url,
            cuisines: req.body.cuisines,
            tags: req.body.tags
        }
        const eatery = await user.employee?.createEatery(eateryData);
        return res.status(200).json({ok: true, eatery: eatery?.data});
    } catch(e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ok: false, error: e.json});
        else return res.status(400).json({ok: false, error: e});
    }
}