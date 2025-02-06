import { IDocument, Types, ObjectTypeCode } from "./prototypes";

export enum MnemonicRating {
    no = 0,
    disgusting = 1,
    nasty = 2,
    ordinary = 3,
    nice = 4,
    excellent = 5
}export interface IFeedback extends IDocument {
    userId?: Types.ObjectId;
    rating: MnemonicRating;
    comment?: string;
    objectType: ObjectTypeCode;
    objectId: Types.ObjectId;
    answerToId?: Types.ObjectId;
}

export interface IFeedbacksSummary {
    rating: number;
    count: number;
}

