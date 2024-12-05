import { IRating } from './eatery';
import { Document, IDocument, IDocumentDataSchema, IDocumentWFSchema, Types, WorkflowStatusCode } from './protodocument';

export interface IMeal extends IDocument {
    name: string;
    eateryAuthorId: Types.ObjectId;
    description: string;
    volumeOptions: string[];
    rating?: IRating;
}

interface IMealDataSchema extends IDocumentDataSchema {}

interface IMealWFSchema extends IDocumentWFSchema {}

export class Meal extends Document<IMeal, IMealDataSchema, IMealWFSchema> {
    get dataSchema(): IMealDataSchema {
        return {
            idFieldName: 'id',
            tableName: 'meals',
            relatedTablesPrefix: 'meal_',
            fields: [
                { name: `eateryAuthorId`, type: 'INT(20)', required: true },
                { name: `name`, type: 'varchar(128)', required: true },
                { name: `description`, type: 'json' },
                { name: `volumeOptions`, type: 'json' },
                { name: `rating`, type: 'json' },
                {
                    name: `awards`,
                    type: 'json',
                },
                {
                    name: `photos`,
                    type: 'json',
                },
                {
                    name: `tags`,
                    type: 'json',
                },
            ],
            indexes: [{ fields: ['name', 'eateryAuthorId'], indexType: 'UNIQUE' }],
        };
    }

    get wfSchema(): IMealWFSchema {
        return {
            tableName: 'meals',
            initialState: WorkflowStatusCode.registered,
            transfers: [
                {
                    from: WorkflowStatusCode.registered,
                    to: WorkflowStatusCode.approved,
                },
            ],
            related: [],
        };
    }
}
