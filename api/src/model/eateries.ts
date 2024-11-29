import { createHmac } from "crypto";
import { IWorkflowObject, Types, WorkflowError, WorkflowErrorCode, WorkflowObject, WorkflowObjectSchema } from "./sqlproto";

interface ITimeSlot {

}

interface IEaterySchema extends WorkflowObjectSchema {

}

export interface IEatery extends IWorkflowObject {
    name: string;
    employees: {
        employeeId: Types.ObjectId;
        roles: string;
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
    published?: boolean;
}

export class Eatery extends WorkflowObject<IEatery, IEaterySchema> {
    get schema(): IEaterySchema {
        return {
            idFieldName: "id",
            tableName: "eateries",
            relatedTablesPrefix: "eatery_",
            fields: [
                { name: `name`, sql: 'varchar(128) NOT NULL' },
                { name: `rating`, sql: 'float DEFAULT NULL' },
                { name: `url`, sql: 'varchar(2048) DEFAULT NULL' },
                { name: `photos`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL' },
                { name: `description`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL' },
                { name: `tags`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL' },
                { name: `cuisines`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL' },
                { name: `avgbillwoalcohol`, sql: 'float DEFAULT NULL' },
                { name: `published`, sql: 'tinyint(1) NOT NULL DEFAULT 0' },
            ],
            related: [
                {
                    tableName: 'tables',
                    idFieldName: "id",
                    fields: [
                        { name: `name`, sql: 'varchar(1024) NOT NULL' },
                        { name: `rating`, sql: 'float DEFAULT NULL' },
                    ]
                },
                {
                    tableName: 'employees',
                    idFieldName: "id",
                    fields: [
                        { name: `employeeId`, sql: 'bigint(20) NOT NULL' },
                        { name: `roles`, sql: 'varchar(2048) DEFAULT NULL' },
                    ]
                }

            ]
        };
    }
}

/**
 * 
 */
interface IEmployeeSchema extends WorkflowObjectSchema {

}

interface IEmployee extends IWorkflowObject {
    login: number | string;     /**Telegram ID or login or phone */
    hash: string;               /** */
    name?: string;
    rating?: number;
    awards?: string;
    photos?: string;
    bio?: string;
    tags?: string;
}

export class Employee extends WorkflowObject<IEmployee, IEmployeeSchema> {
    get schema(): IEmployeeSchema {
        return {
            idFieldName: "id",
            tableName: "employees",
            relatedTablesPrefix: "employee_",
            fields: [
                { name: `login`, sql: 'varchar(128) NOT NULL' },
                { name: `hash`, sql: 'varchar(128) NOT NULL' },
                { name: `name`, sql: 'varchar(128) DEFAULT NULL' },
                { name: `rating`, sql: 'float DEFAULT NULL' },
                { name: `awards`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`))' },
                { name: `photos`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`))' },
                { name: `bio`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL' },
                { name: `tags`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL' },
            ],
            indexes: [
                {fields: ["login"], indexType: "UNIQUE"}
            ]
        };
    }

    static calcHash(login: string, secretKey: string): string {
        const hash = createHmac("sha256", `${login} ${secretKey}`).digest("hex");
        return hash;
    }

    checkSecretKey(secretKey?: string): boolean {
        const hash = Employee.calcHash(this.data.login.toString(), secretKey === undefined?"":secretKey);
        return this.data.hash === hash;
    }

    async createEatery(eateryData: IEatery): Promise<Eatery> {
        if (this.id === undefined) throw new WorkflowError(WorkflowErrorCode.abstract_method, `Load`);
        eateryData.createdByUser = this.data.login.toString();
        eateryData.changedByUser = this.data.login.toString();
        eateryData.employees.push({employeeId: this.id, roles: "Administrator"});
        const eatery = new Eatery(eateryData);

        await eatery.save();
        return eatery;
    }
}

interface IBooking extends IWorkflowObject {
    eateryId: Types.ObjectId;
    mnemNumber: string;
    mainGuestId: Types.ObjectId;
    whoPaysGuestId: Types.ObjectId[];
    guestIds: Types.ObjectId[];
    tableIds: Types.ObjectId[];
    timeSlot: ITimeSlot;
}

interface IGuest extends IWorkflowObject {

}

interface IMeal extends IWorkflowObject {

}

interface IOrder extends IWorkflowObject {

}

interface ITable extends IWorkflowObject {
    name: string;
    guestCountMax?: number;
    guestCountComfort?: number;
    timeSlots?: [ITimeSlot];
}

interface IEntertainment extends IWorkflowObject {

}

interface IDeliveryPartner extends IWorkflowObject {

}

interface IInvoice extends IWorkflowObject {

}

interface IPayment extends IWorkflowObject {

}