import { Context } from 'openapi-backend';
import { Request, Response } from 'express';
import { DocumentError } from '../model/protodocument';
import { DocumentErrorCode } from '../types/prototypes';
import { User } from '../model/user';
import { randomUUID } from 'crypto';

export async function newUser(c: Context, req: Request, res: Response, user: User) {
    const login = req.headers['coodfort-login'] as string;
    const password = req.headers['coodfort-password'] as string;
    const tguid = req.headers['coodfort-tguid'] as string;
    const tgcheckstring = req.headers['coodfort-tgquerycheckstring'] as string;
    const name = req.body.name;
    const bios = req.body.bios;
    const tags = req.body.tags;
    let lgn: string;
    let psw: string;
    try {
        if (login === undefined && password === undefined) {
            if (tguid === undefined && tgcheckstring === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Path '${req.path}' expects parameter 'password'`);
            lgn = `TG:${tguid}`;
            psw = randomUUID();
        } else {
            lgn = login;
            psw = password;
        }
        const newUser = new User({
            login: lgn,
            hash: User.calcHash(lgn, psw),
            name: name,
            bios: bios,
            tags: tags,
        });
        await newUser.save(lgn);
        return res.status(200).json({ ok: true, user: newUser.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function viewUser(c: Context, req: Request, res: Response, user: User) {
    const id = req.body.id;
    if (id === undefined) {
        if (user !== undefined) return res.status(200).json({ ok: true, user: user.data });
        else return res.status(404).json({ ok: false, error: { code: -1, message: 'User not found' } });
    }
    try {
        const anUser = new User(id);
        await anUser.load();
        return res.status(200).json({ ok: true, user: anUser.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function userEateriesList(c: Context, req: Request, res: Response, user: User) {
    try {
        return res.status(200).json({ ok: true, eateries: await user.eateriesList() });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function userMealsList(c: Context, req: Request, res: Response, user: User) {
    try {
        return res.status(200).json({ ok: true, meals: await user.mealsList() });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function userMenusList(c: Context, req: Request, res: Response, user: User) {
    try {
        return res.status(200).json({ ok: true, menus: await user.menusList() });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}
