import { createHmac } from 'crypto';
import { DocumentError, Document, IDocumentDataSchema, IDocumentWFSchema } from './protodocument';
import { WorkflowStatusCode } from '../types/prototypes';
import { DocumentErrorCode } from '../types/prototypes';
import { Types } from '../types/prototypes';
import { EateryRoleCode, IEatery, IEateryBrief, IEmployee } from '../types/eaterytypes';
import { mconsole } from './console';
import { RowDataPacket } from 'mysql2';

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
                { name: `rating`, type: 'json' },
                { name: `urls`, type: 'json' },
                { name: `photos`, type: 'json' },
                { name: `descriptions`, type: 'json' },
                { name: `tags`, type: 'json' },
                { name: `cuisines`, type: 'json' },
                { name: `awards`, type: 'json' },
                { name: `averageBills`, type: 'json' },
                { name: `menuId`, type: 'BIGINT(20)', required: false },
            ],
            related: [
                {
                    tableName: 'tables',
                    idFieldName: 'id',
                    fields: [
                        { name: `name`, type: 'json', required: true },
                        { name: `rating`, type: 'json' },
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

/**
 *
 */
interface IEmployeeSchema extends IDocumentDataSchema {}

export class Employee extends Document<IEmployee, IEmployeeSchema, IEateryWFSchema> {
    get dataSchema(): IEmployeeSchema {
        return {
            idFieldName: 'id',
            tableName: 'employees',
            relatedTablesPrefix: 'employee_',
            fields: [
                { name: `login`, type: 'varchar(128)', required: true },
                { name: `hash`, type: 'varchar(128)', required: true },
                { name: `name`, type: 'varchar(128)' },
                { name: `ratings`, type: 'json' },
                { name: `awards`, type: 'json' },
                { name: `photos`, type: 'json' },
                { name: `bios`, type: 'json' },
                { name: `tags`, type: 'json' },
            ],
            indexes: [{ fields: ['login'], indexType: 'UNIQUE' }],
        };
    }

    static calcHash(login: string, secretKey: string): string {
        const hash = createHmac('sha256', `${login} ${secretKey}`).digest('hex');
        return hash;
    }

    checkSecretKey(secretKey?: string): boolean {
        const hash = Employee.calcHash(this.data.login.toString(), secretKey === undefined ? '' : secretKey);
        return this.data.hash === hash;
    }

    async createEatery(eateryData: IEatery): Promise<Eatery> {
        eateryData.employees.push({
            employeeId: this.id,
            roles: EateryRoleCode.owner,
        });
        const eatery = new Eatery(eateryData);

        await eatery.save(this.data.login.toString());
        return eatery;
    }

    async updateEatery(eateryData: IEatery): Promise<Eatery> {
        if (eateryData.id === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Parameter 'id' is mandatory`);
        const eatery = new Eatery(eateryData.id);
        await eatery.load();
        if (!eatery.checkRoles(EateryRoleCode.MDM, this.id)) await eatery.save(this.data.login.toString());
        return eatery;
    }

    async eateriesList(): Promise<IEateryBrief[]> {
        const sql =
            'select `eateries`.*, `linkedEateries`.`roles` from (SELECT `eatery_employees`.`eatery_id` as `id`, `roles` FROM `eatery_employees` WHERE `eatery_employees`.`employeeId` = ?) as `linkedEateries` INNER join `eateries` on `linkedEateries`.`id` = `eateries`.`id`';
        mconsole.sqlq(sql, [this.id]);
        const [rows, fields] = await this.sqlConnection.query<IEateryBrief[]>(sql, [this.id]);
        rows.forEach(row => this.jsonTranslate(row, new Eatery().dataSchema));
        mconsole.sqlinfo(rows, fields);
        return rows;
    }

    get wfSchema(): IDocumentWFSchema {
        return {
            tableName: 'eatery',
            initialState: WorkflowStatusCode.done,
        };
    }
}
