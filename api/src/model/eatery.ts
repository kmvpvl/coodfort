import { DocumentError, Document, IDocumentDataSchema, IDocumentWFSchema } from './protodocument';
import { WorkflowStatusCode } from '../types/prototypes';
import { DocumentErrorCode } from '../types/prototypes';
import { Types } from '../types/prototypes';
import { EateryRoleCode, IEatery, IEateryBrief, IMealRow, IMenuRow } from '../types/eaterytypes';
import { IUser } from './protodocument';
import { mconsole } from './console';
import { Meal, Menu } from './meal';
import { User } from './user';

interface IEateryDataSchema extends IDocumentDataSchema {}

interface IEateryWFSchema extends IDocumentWFSchema {}

export class Eatery extends Document<IEatery, IEateryDataSchema, IEateryWFSchema> {
    get dataSchema(): IEateryDataSchema {
        return {
            idFieldName: 'id',
            tableName: 'eateries',
            relatedTablesPrefix: 'eatery_',
            fields: [
                { name: `name`, type: 'json', required: true },
                { name: `url`, type: 'json' },
                { name: 'coords', type: 'json' },
                { name: `photos`, type: 'json' },
                { name: `description`, type: 'json' },
                { name: `tags`, type: 'json' },
                { name: `cuisines`, type: 'json' },
                { name: `averageBills`, type: 'json' },
                { name: `menuId`, type: 'BIGINT(20)', required: false },
            ],
            related: [
                {
                    tableName: 'tables',
                    idFieldName: 'id',
                    fields: [
                        { name: `name`, type: 'json', required: true },
                        { name: `tags`, type: 'json' },
                        { name: `photos`, type: 'json' },
                        { name: `guestCountMin`, type: 'int(11)' },
                        { name: `guestCountMax`, type: 'int(11)' },
                    ],
                },
                {
                    tableName: 'employees',
                    idFieldName: 'id',
                    fields: [
                        { name: `employeeId`, type: 'bigint(20)', required: true },
                        { name: `roles`, type: 'varchar(2048)' },
                    ],
                },
            ],
        };
    }

    get wfSchema(): IEateryWFSchema {
        return {
            tableName: 'eateries',
            initialState: WorkflowStatusCode.registered,
            transfers: [
                {
                    from: WorkflowStatusCode.registered,
                    to: WorkflowStatusCode.approved,
                },
            ],
            related: [
                {
                    tableName: 'tables',
                    initialState: WorkflowStatusCode.draft,
                    transfers: [
                        {
                            from: WorkflowStatusCode.draft,
                            to: WorkflowStatusCode.approved,
                        },
                    ],
                },
                {
                    tableName: 'employees',
                    initialState: WorkflowStatusCode.approved,
                },
            ],
        };
    }

    checkRoles(roleToCheck: EateryRoleCode, employeeId: Types.ObjectId): boolean {
        return this.data.employees.some(empl => empl.employeeId === employeeId && (empl.roles === roleToCheck || empl.roles === EateryRoleCode.owner));
    }
}
