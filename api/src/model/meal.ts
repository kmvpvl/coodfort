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
            idFieldName: "id",
            tableName: "meals",
            relatedTablesPrefix: "meal_",
            fields: [
                { name: `eateryAuthorId`, sql: 'INT(20) NOT NULL' },
                { name: `name`, sql: 'varchar(128) NOT NULL' },
                { name: `description`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL' },
                { name: `volumeOptions`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin CHECK (json_valid(`volumeOptions`))' },
                { name: `rating`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rating`))' },
                {
                    name: `awards`,
                    sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`awards`))',
                },
                {
                    name: `photos`,
                    sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`))',
                },
                {
                    name: `tags`,
                    sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL',
                },
            ],
            indexes: [{ fields: ['name', 'eateryAuthorId'], indexType: 'UNIQUE' }],
        }
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
