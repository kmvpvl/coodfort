import { createHmac } from 'crypto';
import { IDocument, Types, DocumentError, DocumentErrorCode, Document, IDocumentDataSchema, IDocumentWFSchema, WorkflowStatusCode } from './protodocument';

interface ITimeSlot {}

interface IEateryDataSchema extends IDocumentDataSchema {}

interface IEateryWFSchema extends IDocumentWFSchema {}

export enum EateryRoleCode {
    'supervisor' = 'supervisor',
    'administrator' = 'administrator',
    'MDM' = 'MDM',
}

export interface IEatery extends IDocument {
    name: string;
    employees: {
        employeeId: Types.ObjectId;
        roles: EateryRoleCode;
        objects?: {
            type: string;
            id: Types.ObjectId;
        }[];
    }[];
    tables: ITable[];
    deliveryPartnerIds: Types.ObjectId[];
    entertainmentIds: Types.ObjectId[];
    rating?: number;
    url?: string;
    photos?: string;
    description?: string;
    tags?: string;
    cuisines?: string;
    avgbillwoalcohol?: number;
}

export class Eatery extends Document<IEatery, IEateryDataSchema, IEateryWFSchema> {
    get dataSchema(): IEateryDataSchema {
        return {
            idFieldName: 'id',
            tableName: 'eateries',
            relatedTablesPrefix: 'eatery_',
            fields: [
                { name: `name`, sql: 'varchar(128) NOT NULL' },
                { name: `rating`, sql: 'float DEFAULT NULL' },
                { name: `url`, sql: 'varchar(2048) DEFAULT NULL' },
                {
                    name: `photos`,
                    sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL',
                },
                {
                    name: `description`,
                    sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL',
                },
                {
                    name: `tags`,
                    sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL',
                },
                {
                    name: `cuisines`,
                    sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL',
                },
                { name: `avgbillwoalcohol`, sql: 'float DEFAULT NULL' },
            ],
            related: [
                {
                    tableName: 'tables',
                    idFieldName: 'id',
                    fields: [
                        { name: `name`, sql: 'varchar(1024) NOT NULL' },
                        { name: `rating`, sql: 'float DEFAULT NULL' },
                    ],
                },
                {
                    tableName: 'employees',
                    idFieldName: 'id',
                    fields: [
                        { name: `employeeId`, sql: 'bigint(20) NOT NULL' },
                        { name: `roles`, sql: 'varchar(2048) DEFAULT NULL' },
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
        return this.data.employees.some(empl => empl.employeeId === employeeId && (empl.roles === roleToCheck || empl.roles === EateryRoleCode.administrator));
    }
}

/**
 *
 */
interface IEmployeeSchema extends IDocumentDataSchema {}

interface IEmployee extends IDocument {
    login: number | string /**Telegram ID or login or phone */;
    hash: string /** */;
    name?: string;
    rating?: number;
    awards?: string;
    photos?: string;
    bio?: string;
    tags?: string;
}

export class Employee extends Document<IEmployee, IEmployeeSchema, IEateryWFSchema> {
    get dataSchema(): IEmployeeSchema {
        return {
            idFieldName: 'id',
            tableName: 'employees',
            relatedTablesPrefix: 'employee_',
            fields: [
                { name: `login`, sql: 'varchar(128) NOT NULL' },
                { name: `hash`, sql: 'varchar(128) NOT NULL' },
                { name: `name`, sql: 'varchar(128) DEFAULT NULL' },
                { name: `rating`, sql: 'float DEFAULT NULL' },
                {
                    name: `awards`,
                    sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`))',
                },
                {
                    name: `photos`,
                    sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`))',
                },
                {
                    name: `bio`,
                    sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL',
                },
                {
                    name: `tags`,
                    sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL',
                },
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
            roles: EateryRoleCode.administrator,
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

    get wfSchema(): IDocumentWFSchema {
        return {
            tableName: 'eatery',
            initialState: WorkflowStatusCode.done,
        };
    }
}

interface IBooking extends IDocument {
    eateryId: Types.ObjectId;
    mnemNumber: string;
    mainGuestId: Types.ObjectId;
    whoPaysGuestId: Types.ObjectId[];
    guestIds: Types.ObjectId[];
    tableIds: Types.ObjectId[];
    timeSlot: ITimeSlot;
}

interface IGuest extends IDocument {}

interface IMeal extends IDocument {}

interface IOrder extends IDocument {}

interface ITable extends IDocument {
    name: string;
    guestCountMax?: number;
    guestCountComfort?: number;
    timeSlots?: [ITimeSlot];
}

interface IEntertainment extends IDocument {}

interface IDeliveryPartner extends IDocument {}

interface IInvoice extends IDocument {}

interface IPayment extends IDocument {}
