import { IAward, IPhoto, IRating } from './eatery';
import { Document, IDocument, IDocumentDataSchema, IDocumentWFSchema, Types, WorkflowStatusCode } from './protodocument';

export interface IMeal extends IDocument {
    name: string;
    eateryAuthorId?: Types.ObjectId;
    description: Types.MLString;
    volumeOptions: Types.MLString[];
    includeOptions?: Types.MLString[];
    excludeOptions?: Types.MLString[];
    rating?: IRating;
    awards?: IAward[];
    photos?: IPhoto[];
    tags?: Types.MLString[];
}

export interface IMenuItem {
    separatorHtml: Types.MLString;
    chapters: IMenuChapter[];
    headerHtml: Types.MLString;
    footerHtml: Types.MLString;
    notesHtml: Types.MLString;
    mealId?: Types.ObjectId;
    meal?: IMeal;
    restrictions: Types.MLString[];
}

export interface IMenuChapter {
    name: Types.MLString;
    description: Types.MLString;
    items: IMenuItem[];
    headerHtml: Types.MLString;
    footerHtml: Types.MLString;
    notesHtml: Types.MLString;
    restrictions: Types.MLString[];
}

export interface IMenu extends IDocument {
    eateryAuthorId: Types.ObjectId;
    headerHtml: Types.MLString;
    footerHtml: Types.MLString;
    notesHtml: Types.MLString;
    restrictions: Types.MLString[];
    chapters: IMenuChapter[];
}

interface IMealDataSchema extends IDocumentDataSchema {}

interface IMealWFSchema extends IDocumentWFSchema {}

interface IMenuDataSchema extends IDocumentDataSchema {}

interface IMenuWFSchema extends IDocumentWFSchema {}

export class Menu extends Document<IMenu, IMenuDataSchema, IMenuWFSchema> {
    get dataSchema(): IMealDataSchema {
        return {
            idFieldName: 'id',
            tableName: 'menus',
            relatedTablesPrefix: 'menu_',
            fields: [
                { name: `eateryAuthorId`, type: 'INT(20)', required: true },
                { name: `headerHtml`, type: 'varchar(128)', required: true },
                { name: `description`, type: 'json' },
                { name: `volumeOptions`, type: 'json' },
                { name: `rating`, type: 'json' },
                { name: `awards`, type: 'json' },
                { name: `photos`, type: 'json' },
                { name: `tags`, type: 'json' },
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

export class Meal extends Document<IMeal, IMealDataSchema, IMealWFSchema> {
    get dataSchema(): IMealDataSchema {
        return {
            idFieldName: 'id',
            tableName: 'meals',
            relatedTablesPrefix: 'meal_',
            fields: [
                { name: `eateryAuthorId`, type: 'INT(20)', required: true },
                { name: `name`, type: 'json', required: true },
                { name: `description`, type: 'json' },
                { name: `volumeOptions`, type: 'json' },
                { name: `rating`, type: 'json' },
                { name: `awards`, type: 'json' },
                { name: `photos`, type: 'json' },
                { name: `tags`, type: 'json' },
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
