import { Context } from 'openapi-backend';
import { AuthUser } from '../model/security';
import { Request, Response } from 'express';
import { DocumentError, DocumentErrorCode, Types } from '../model/protodocument';
import { IMeal, Meal } from '../model/meal';

function mealDataFromBody(req: Request): IMeal {
    if (req.body.name === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Parameter 'name' is mandatory`);
    const mealData: IMeal = {
        name: 'Фруктовый салат',
        description: 'Салат из бананов, яблок и апельсинов со сметаной',
        volumeOptions: ['235 гр. (75/75/75/10 гр.)'],
        eateryAuthorId: 1,
    };
    return mealData;
}

export async function newMeal(c: Context, req: Request, res: Response, user: AuthUser) {
    try {
        const meal = new Meal(mealDataFromBody(req));
        await meal.save(user.employee?.data.login.toString());
        return res.status(200).json({ ok: true, meal: meal.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: e });
    }
}
