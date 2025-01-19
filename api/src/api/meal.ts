import { Context } from 'openapi-backend';
import { Request, Response } from 'express';
import { DocumentError } from '../model/protodocument';
import { Meal, Menu } from '../model/meal';
import { DocumentErrorCode } from '../types/prototypes';
import { User } from '../model/user';

export async function updateMeal(c: Context, req: Request, res: Response, user: User) {
    try {
        const meal = new Meal();
        if (req.body.id === undefined) {
            req.body.userId = user.id;
        } else {
            const tempMeal = new Meal(req.body.id);
            await tempMeal.load();
            if (tempMeal.data.userId !== user.id) return res.status(403).json({ ok: false, error: `` });
        }
        meal.checkMandatory(req.body);
        await meal.load(req.body);
        await meal.save(user.data.login.toString());
        return res.status(200).json({ ok: true, meal: meal.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function viewMeal(c: Context, req: Request, res: Response, user: User) {
    try {
        if (req.body.id === undefined) {
            throw new DocumentError(DocumentErrorCode.parameter_expected, `Meal id expected`);
        }
        const meal = new Meal(req.body.id);
        await meal.load();
        return res.status(200).json({ ok: true, meal: meal.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function updateMenu(c: Context, req: Request, res: Response, user: User) {
    try {
        const menu = new Menu();
        if (req.body.id === undefined) {
            req.body.userId = user.id;
        } else {
            const tempMenu = new Menu(req.body.id);
            await tempMenu.load();
            if (tempMenu.data.userId !== user.id) return res.status(403).json({ ok: false, error: `` });
        }
        menu.checkMandatory(req.body);
        await menu.load(req.body);
        await menu.save(user.data.login.toString());
        return res.status(200).json({ ok: true, menu: menu.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function viewMenu(c: Context, req: Request, res: Response, user: User) {
    try {
        if (req.body.id === undefined) {
            throw new DocumentError(DocumentErrorCode.parameter_expected, `Menu id expected`);
        }
        const menu = new Menu(req.body.id);
        await menu.load();
        return res.status(200).json({ ok: true, menu: menu.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}
