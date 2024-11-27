import { createHmac } from "crypto";
import { IWorkflowObject, Types, WorkflowObject, WorkflowObjectSchema } from "./sqlproto";

interface ITimeSlot {

}

interface IEaterySchema extends WorkflowObjectSchema {

}

export interface IEatery extends IWorkflowObject {
    name: string;
    employeeIds: Types.ObjectId[];
    tables: ITable[];
    deliveryPartnerIds: Types.ObjectId[];
    entertainmentIds: Types.ObjectId[];
    rating?: number;
    url?: string;
    photos?: string;
    descriptions?: string;
    tags?: string;
    cuisines?: string;
    avgbillwoalcohol?: number;
    published: boolean;
}

export class Eatery extends WorkflowObject<IEatery, IEaterySchema> {
    get schema(): IEaterySchema {
        return {
            idFieldName: "id",
            tableName: "eateries",
            relatedTablesPrefix: "eatery_",
            fields: [
                { name: `name`, sql: 'varchar(1024) NOT NULL' },
                { name: `rating`, sql: 'float DEFAULT NULL' },
                { name: `url`, sql: 'varchar(2048) DEFAULT NULL' },
                { name: `photos`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`))' },
                { name: `descriptions`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`descriptions`))' },
                { name: `tags`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`))' },
                { name: `cuisines`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`cuisines`))' },
                { name: `avgbillwoalcohol`, sql: 'float DEFAULT NULL' },
                { name: `published`, sql: 'tinyint(1) NOT NULL DEFAULT 0' },
            ],
            related: [
                {
                    tableName: 'tables',
                    idFieldName: "id",
                    fields: [
                        //{name:`eatery_id`, sql: 'bigint(20) NOT NULL'},
                        { name: `name`, sql: 'varchar(1024) NOT NULL' },
                        { name: `rating`, sql: 'float DEFAULT NULL' },
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
    name: string;
    rating: number;
    awards: string;
    photos: string;
    bio: string;
    tags: string;
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
                { name: `name`, sql: 'varchar(128) NOT NULL' },
                { name: `rating`, sql: 'float DEFAULT NULL' },
                { name: `awards`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`))' },
                { name: `photos`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`))' },
                { name: `bio`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`descriptions`))' },
                { name: `tags`, sql: 'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`))' },
            ],
        };
    }

    private calcHash(secretKey: string): string {
        const hash = createHmac("sha256", `${this.data.login} ${secretKey}`).digest("hex");
        return hash;
    }

    checkSecretKey(secretKey: string): boolean {
        const hash = this.calcHash(secretKey);
        return this.data.hash === hash;
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