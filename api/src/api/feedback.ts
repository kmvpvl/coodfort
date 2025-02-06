import { Context } from 'openapi-backend';
import { Request, Response } from 'express';
import { User } from '../model/user';
import { Feedback } from '../model/feedback';
import { DocumentError } from '../model/protodocument';
import { IFeedback, IFeedbacksSummary } from '../types/feedback';
export async function updateFeedback(c: Context, req: Request, res: Response, user: User) {
    try {
        let id = req.body.id;
        const prevFeedback = new Feedback();
        await prevFeedback.getCollection(`\`userId\`=? and \`objectId\`=? and \`objectType\`=? and \`answerToId\`${req.body.answerToId === undefined?'is null':'=?'}`, [
            user.id,
            req.body.objectId,
            req.body.objectType,
            req.body.answerToId
        ], "`created` DESC");
        if (prevFeedback.collection.length>0) id = prevFeedback.collection[0].id;

        const feedback = new Feedback({...req.body, id: id});
        if (id !== undefined) await feedback.load();
        feedback.load({...feedback.data, userId: user.id, rating: req.body.rating, comment: req.body.comment});
        await feedback.save(user.data.login);
        return res.status(200).json({ ok: true, feedback: feedback.data });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

export async function feedbackList(c: Context, req: Request, res: Response, user: User) {
    try {
        const prevFeedback = new Feedback();
        await prevFeedback.getCollection(`\`objectId\`=? and \`objectType\`=? ${req.body.userId !== undefined?`and \`userId\`=?`:""}`, [
            req.body.objectId,
            req.body.objectType,
            user.id,
        ], "`created` DESC");

        const ret: IFeedback[] = [];
        const summary: IFeedbacksSummary = {
            rating: 0,
            count:0
        }
        for (const f of prevFeedback.collection){
            const feedback = new Feedback(f.id);
            await feedback.load();
            ret.push(feedback.data);
            summary.rating = (summary.rating * summary.count + feedback.data.rating)/(++summary.count);
        };
        return res.status(200).json({ ok: true, feedbacks: ret, summary: summary });
    } catch (e: any) {
        if (e instanceof DocumentError) return res.status(400).json({ ok: false, error: e.json });
        else return res.status(400).json({ ok: false, error: { message: e.message } });
    }
}

