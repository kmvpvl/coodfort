import { Context } from 'openapi-backend';
import { AuthUser } from '../model/security';
import { Request, Response } from 'express';
import { DocumentError } from '../model/protodocument';
import { DocumentErrorCode } from '../types/prototypes';
import { Types } from '../types/prototypes';
import { Meal } from '../model/meal';
import { IMeal } from '../types/eaterytypes';

function mealDataFromBody(req: Request): IMeal {
    if (req.body.name === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Parameter 'name' is mandatory`);
    const mealData: IMeal = {
        eateryAuthorId: req.body.eateryAuthorId,
        name: req.body.name,
        description: req.body.description,
        options: req.body.options,
        photos: req.body.photos,
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
