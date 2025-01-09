import { Context } from 'openapi-backend';
import { Request, Response } from 'express';
import { DocumentError } from '../model/protodocument';
import { DocumentErrorCode } from '../types/prototypes';
import { User } from '../model/user';

export async function newEmployee(c: Context, req: Request, res: Response, user: User) {
    const login = req.headers['coodfort-login'] as string;
    const password = req.headers['coodfort-password'] as string;
    const name = req.body.name;
    const bios = req.body.bios;
    const tags = req.body.tags;

    try {
        if (login === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Path '${req.path}' expects parameter 'login'`);
        if (password === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Path '${req.path}' expects parameter 'password'`);
        const newEmpl = new User({
            login: login,
            hash: User.calcHash(login, password),
            name: name,
            bios: bios,
            tags: tags,
        });
        await newEmpl.save(login);
        return res.status(200).json({ ok: true, employee: newEmpl.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function viewEmployee(c: Context, req: Request, res: Response, user: User) {
    const id = req.body.id;
    if (id === undefined) return res.status(200).json({ ok: true, employee: user.data });
    try {
        const empl = new User(id);
        await empl.load();
        return res.status(200).json({ ok: true, employee: empl.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function employeeEateriesList(c: Context, req: Request, res: Response, user: User) {
    try {
        const empl = user;
        return res.status(200).json({ ok: true, eateries: await empl.eateriesList() });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function employeeMealsList(c: Context, req: Request, res: Response, user: User) {
    try {
        const empl = user;
        return res.status(200).json({ ok: true, meals: await empl.mealsList() });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function employeeMenusList(c: Context, req: Request, res: Response, user: User) {
    try {
        const empl = user;
        return res.status(200).json({ ok: true, menus: await empl.menusList() });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}
