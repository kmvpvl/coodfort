import { Context } from 'openapi-backend';
import { AuthUser } from '../model/security';
import { Request, Response } from 'express';
import { Employee } from '../model/eatery';
import { DocumentError } from '../model/protodocument';
import { DocumentErrorCode } from '../types/prototypes';

export async function newEmployee(c: Context, req: Request, res: Response, user: AuthUser) {
    const login = req.headers['coodfort-login'] as string;
    const password = req.headers['coodfort-password'] as string;
    const name = req.body.name;
    const bios = req.body.bios;
    const tags = req.body.tags;

    try {
        if (login === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Path '${req.path}' expects parameter 'login'`);
        if (password === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Path '${req.path}' expects parameter 'password'`);
        const newEmpl = new Employee({
            login: login,
            hash: Employee.calcHash(login, password),
            name: name,
            bios: bios,
            tags: tags,
        });
        await newEmpl.save(login);
        return res.status(200).json({ ok: true, employee: newEmpl.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: e });
    }
}

export async function viewEmployee(c: Context, req: Request, res: Response, user: AuthUser) {
    const id = req.body.id;
    if (id === undefined) return res.status(200).json({ ok: true, employee: user.employee?.data });
    try {
        const empl = new Employee(id);
        await empl.load();
        return res.status(200).json({ ok: true, employee: empl.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: e });
    }
}

export async function employeeEateriesList(c: Context, req: Request, res: Response, user: AuthUser) {
    if (user.employee === undefined) return res.status(401).json({ ok: false, error: {} });
    try {
        const empl = user.employee;
        return res.status(200).json({ ok: true, eateries: await empl.eateriesList() });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: e });
    }
}
