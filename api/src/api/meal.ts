import { Context } from 'openapi-backend';
import { AuthUser } from '../model/security';
import { Request, Response } from 'express';
import { DocumentError } from '../model/protodocument';
import { Meal, Menu } from '../model/meal';

export async function updateMeal(c: Context, req: Request, res: Response, user: AuthUser) {
    try {
        const meal = new Meal();
        if (req.body.id === undefined) {
            req.body.employeeId = user.employee?.id;
        } else {
            const tempMeal = new Meal(req.body.id);
            await tempMeal.load();
            if (tempMeal.data.employeeId !== user.employee?.id) return res.status(403).json({ ok: false, error: `` });
        }
        meal.checkMandatory(req.body);
        await meal.load(req.body);
        await meal.save(user.employee?.data.login.toString());
        return res.status(200).json({ ok: true, meal: meal.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: e });
    }
}

export async function updateMenu(c: Context, req: Request, res: Response, user: AuthUser) {
    try {
        const menu = new Menu();
        if (req.body.id === undefined) {
            req.body.employeeId = user.employee?.id;
        } else {
            const tempMenu = new Menu(req.body.id);
            await tempMenu.load();
            if (tempMenu.data.employeeId !== user.employee?.id) return res.status(403).json({ ok: false, error: `` });
        }
        menu.checkMandatory(req.body);
        await menu.load(req.body);
        await menu.save(user.employee?.data.login.toString());
        return res.status(200).json({ ok: true, menu: menu.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: e });
    }
}
