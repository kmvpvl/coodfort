import { WorkflowStatusCode } from "../types/prototypes";
import { IFeedback } from "../types/feedback";
import { IDocumentDataSchema, IDocumentWFSchema, Document } from "./protodocument";

interface IFeedbackDataSchema extends IDocumentDataSchema {}
interface IFeedbackWFSchema extends IDocumentWFSchema {}

export class Feedback extends Document<IFeedback, IFeedbackDataSchema, IFeedbackWFSchema> {
    get dataSchema(): IFeedbackDataSchema {
        return {
            idFieldName: 'id',
            tableName: 'feedbacks',
            fields: [
                { name: `userId`, type: 'bigint(20)', required: true },
                { name: `objectId`, type: 'bigint(20)', required: true },
                { name: `objectType`, type: 'varchar(256)', required: true },
                { name: `rating`, type: 'int(11)', required: true },
                { name: `comment`, type: 'varchar(512)' },
                { name: `answerToId`, type: 'bigint(20)', required: false },
            ],
            indexes: [{
                fields: ['userId', 'objectId', 'objectType', 'answerToId'],
                indexType: "UNIQUE"
            }]
        };
    }

    get wfSchema(): IFeedbackWFSchema {
        return {
            tableName: 'feedbacks',
            initialState: WorkflowStatusCode.draft,
            transfers: [
                {from: WorkflowStatusCode.draft, to: WorkflowStatusCode.registered}
            ]
        };
    }
}
