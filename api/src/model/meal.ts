import { IMeal, IMenu } from '../types/eaterytypes';
import { Document, IDocumentDataSchema, IDocumentWFSchema } from './protodocument';
import { WorkflowStatusCode } from '../types/prototypes';

interface IMealDataSchema extends IDocumentDataSchema {}

interface IMealWFSchema extends IDocumentWFSchema {}

interface IMenuDataSchema extends IDocumentDataSchema {}

interface IMenuWFSchema extends IDocumentWFSchema {}

export class Menu extends Document<IMenu, IMenuDataSchema, IMenuWFSchema> {
    get dataSchema(): IMenuDataSchema {
        return {
            idFieldName: 'id',
            tableName: 'menus',
            relatedTablesPrefix: 'menu_',
            fields: [
                { name: `employeeId`, type: 'INT(20)', required: true, comment: 'Author id' },
                { name: `name`, type: 'varchar(256)', required: true },
                { name: `headerHtml`, type: 'json', required: true },
                { name: `footerHtml`, type: 'json', required: true },
                { name: `chapters`, type: 'json', required: true },
                { name: `restrictions`, type: 'json' },
            ],
            indexes: [{ fields: ['id', 'employeeId'], indexType: 'UNIQUE' }],
        };
    }

    get wfSchema(): IMenuWFSchema {
        return {
            tableName: 'menus',
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

export class Meal extends Document<IMeal, IMealDataSchema, IMealWFSchema> {
    get dataSchema(): IMealDataSchema {
        return {
            idFieldName: 'id',
            tableName: 'meals',
            relatedTablesPrefix: 'meal_',
            fields: [
                { name: `employeeId`, type: 'INT(20)', required: true, comment: 'Author id' },
                { name: `eateryId`, type: 'INT(20)', required: false, comment: 'Eatery id' },
                { name: `name`, type: 'json', required: true, comment: 'Short name of meal' },
                { name: `description`, type: 'json', comment: 'Long text described the meal' },
                { name: `photos`, type: 'json', comment: 'DataURI of photos' },
                { name: `tags`, type: 'json', comment: 'Array of tags' },
            ],
            indexes: [{ fields: ['id', 'employeeId', 'eateryId'], indexType: 'UNIQUE' }],
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
