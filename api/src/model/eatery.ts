import { Document, IDocumentDataSchema, IDocumentWFSchema } from './protodocument';
import { WorkflowStatusCode } from '../types/prototypes';
import { Types } from '../types/prototypes';
import { EateryRoleCode, IEatery } from '../types/eaterytypes';

interface IEateryDataSchema extends IDocumentDataSchema {}

interface IEateryWFSchema extends IDocumentWFSchema {}

export class Eatery extends Document<IEatery, IEateryDataSchema, IEateryWFSchema> {
    get dataSchema(): IEateryDataSchema {
        return {
            idFieldName: 'id',
            tableName: 'eateries',
            relatedTablesPrefix: 'eatery_',
            fields: [
                { name: `name`, type: 'json', required: true, comment: 'Multi-language name of Eatery' },
                { name: `url`, type: 'json', comment: 'Caption and href to Eatery website' },
                { name: 'coords', type: 'json', comment: 'Pointer to eatery place' },
                { name: `photos`, type: 'json', comment: 'Photos array' },
                { name: `description`, type: 'json', comment: '2-lines description' },
                { name: `tags`, type: 'json', comment: 'Array of tags' },
                { name: `cuisines`, type: 'json' },
                { name: `averageBills`, type: 'json' },
                { name: `menuId`, type: 'bigint(20)', required: false },
                { name: `tableRequiredToInhouseOrder`, type: 'tinyint(1)', required: false },
                { name: `approveRequiredToReserve`, type: 'tinyint(1)', required: false },
                { name: `esId`, type: 'varchar(256)', required: false },
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
                        { name: `approveRequiredToReserve`, type: 'tinyint(1)', required: false },
                        { name: `esId`, type: 'varchar(256)', required: false },
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
