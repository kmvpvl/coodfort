import { Context } from 'openapi-backend';
import { AuthUser } from '../model/security';
import { Request, Response } from 'express';
import { Employee } from '../model/eatery';
import { DocumentError, DocumentErrorCode } from '../model/protodocument';

export async function newEmployee(
    c: Context,
    req: Request,
    res: Response,
    user: AuthUser
) {
    const login = req.headers['coodfort-login'] as string;
    const password = req.headers['coodfort-password'] as string;
    const name = req.body.name;
    const bio = req.body.bio;
    const tags = req.body.tags;

    try {
        if (login === undefined)
            throw new DocumentError(
                DocumentErrorCode.parameter_expected,
                `Path '${req.path}' expects parameter 'login'`
            );
        if (password === undefined)
            throw new DocumentError(
                DocumentErrorCode.parameter_expected,
                `Path '${req.path}' expects parameter 'password'`
            );
        const newEmpl = new Employee({
            login: login,
            hash: Employee.calcHash(login, password),
            name: name,
            bio: bio,
            tags: tags,
        });
        await newEmpl.save();
        return res.status(200).json({ ok: true, employee: newEmpl.data });
    } catch (e: any) {
        if (e instanceof DocumentError)
            return res
                .status(400)
                .json({ ok: false, error: (e as DocumentError).json });
        return res.status(400).json({ ok: false, error: e });
    }
}
