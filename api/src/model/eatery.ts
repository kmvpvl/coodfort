import { Document, IDocumentDataSchema, IDocumentWFSchema } from './protodocument';
import { WorkflowStatusCode } from '../types/prototypes';
import { Types } from '../types/prototypes';
import { EateryRoleCode, IEatery, IEmployee } from '../types/eaterytypes';
import { IOrder, IOrderItem, IPayment, ITableCallWaiterSignal } from '../types/ordertypes';

interface IEmployeeDataSchema extends IDocumentDataSchema {}
interface IEmployeeWFSchema extends IDocumentWFSchema {}

interface IEateryDataSchema extends IDocumentDataSchema {}
interface IEateryWFSchema extends IDocumentWFSchema {}

export class Employee extends Document<IEmployee, IEmployeeDataSchema, IEmployeeWFSchema> {
    get dataSchema(): IEmployeeDataSchema {
        return {
            idFieldName: 'id',
            tableName: 'eatery_employees',
            fields: [
                { name: `eatery_id`, type: 'bigint(20)', required: true },
                { name: `userId`, type: 'bigint(20)', required: true },
                { name: `roles`, type: 'json' },
            ],
        };
    }

    get wfSchema(): IEmployeeWFSchema {
        return {
            tableName: 'eatery_employees',
            initialState: WorkflowStatusCode.approved,
        };
    }
}

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
                { name: `tableRequiredToOnPremiseOrder`, type: 'tinyint(1)', required: false, default: '1' },
                { name: `approveRequiredToReserve`, type: 'tinyint(1)', required: false, default: '1' },
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
                        { name: `approveRequiredToReserve`, type: 'tinyint(1)', required: false, default: '1' },
                        { name: `esId`, type: 'varchar(256)', required: false },
                    ],
                },
                {
                    tableName: 'employees',
                    idFieldName: 'id',
                    fields: [
                        { name: `userId`, type: 'bigint(20)', required: true },
                        { name: `roles`, type: 'json' },
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

    checkRoles(roleToCheck: EateryRoleCode, userId: Types.ObjectId): boolean {
        return this.data.employees.some(empl => !empl.blocked && empl.userId === userId && (empl.roles.includes(roleToCheck) || empl.roles.includes(EateryRoleCode.owner)));
    }
}
interface ITableCallWaiterSignalDataSchema extends IDocumentDataSchema {}
interface ITableCallWaiterSignalWFSchema extends IDocumentWFSchema {}
export class TableCallWaiterSignal extends Document<ITableCallWaiterSignal, ITableCallWaiterSignalDataSchema, ITableCallWaiterSignalWFSchema> {
    get dataSchema(): ITableCallWaiterSignalDataSchema {
        return {
            tableName: 'tableCallWaiter',
            idFieldName: 'id',
            fields: [
                { name: `tableId`, type: 'bigint(20)', required: true },
                { name: `on`, type: 'tinyint(1)', required: true },
                { name: `userId`, type: 'bigint(20)', required: true },
            ],
        };
    }
    get wfSchema(): ITableCallWaiterSignalWFSchema {
        return {
            tableName: 'tableCallWaiter',
            initialState: WorkflowStatusCode.draft,
        };
    }
}

interface IOrderItemDataSchema extends IDocumentDataSchema {}
interface IOrderItemWFSchema extends IDocumentWFSchema {}

interface IOrderDataSchema extends IDocumentDataSchema {}
interface IOrderWFSchema extends IDocumentWFSchema {}

interface IPaymentDataSchema extends IDocumentDataSchema {}
interface IPaymentWFSchema extends IDocumentWFSchema {}

const paymentDataSchemaFields = [
    { name: `amount`, type: 'float', required: true },
    { name: `currency`, type: 'varchar(256)', required: false },
    { name: `paymentMethod`, type: 'int(11)', required: true },
    { name: `comment`, type: 'varchar(1024)', required: false },
    { name: `esId`, type: 'varchar(256)', required: false },
];

const paymentWFSchemaTransfers = [
    {
        from: WorkflowStatusCode.draft,
        to: WorkflowStatusCode.registered,
    },
    {
        from: WorkflowStatusCode.registered,
        to: WorkflowStatusCode.approved,
    },
    {
        from: WorkflowStatusCode.registered,
        to: WorkflowStatusCode.canceledByEatery,
    },
    {
        from: WorkflowStatusCode.approved,
        to: WorkflowStatusCode.done,
    },
    {
        from: WorkflowStatusCode.done,
        to: WorkflowStatusCode.review,
    },
    {
        from: WorkflowStatusCode.review,
        to: WorkflowStatusCode.closed,
    },
];
export class Payment extends Document<IPayment, IPaymentDataSchema, IPaymentWFSchema> {
    get dataSchema(): IPaymentDataSchema {
        return {
            tableName: 'order_payments',
            idFieldName: 'id',
            fields: [...paymentDataSchemaFields, { name: `order_id`, type: 'bigint(20)', required: true }],
        };
    }

    get wfSchema(): IPaymentWFSchema {
        return {
            tableName: 'order_payments',
            initialState: WorkflowStatusCode.draft,
            transfers: paymentWFSchemaTransfers,
        };
    }
}
export class OrderItem extends Document<IOrderItem, IOrderItemDataSchema, IOrderItemWFSchema> {
    get dataSchema(): IOrderItemDataSchema {
        return {
            tableName: 'order_items',
            idFieldName: 'id',
            fields: [
                { name: `name`, type: 'json', required: true },
                { name: `order_id`, type: 'bigint(20)', required: true },
                { name: `description`, type: 'json', required: true },
                { name: `tags`, type: 'json' },
                { name: `option`, required: true, type: 'json' },
                { name: `count`, type: 'float' },
                { name: `comment`, type: 'varchar(1024)', required: false },
                { name: `esId`, type: 'varchar(256)', required: false },
            ],
        };
    }

    get wfSchema(): IOrderItemWFSchema {
        return {
            tableName: 'order_items',
            initialState: WorkflowStatusCode.draft,
            transfers: [
                {
                    from: WorkflowStatusCode.draft,
                    to: WorkflowStatusCode.registered,
                },
                {
                    from: WorkflowStatusCode.registered,
                    to: WorkflowStatusCode.approved,
                },
                {
                    from: WorkflowStatusCode.registered,
                    to: WorkflowStatusCode.canceledByEatery,
                },
                {
                    from: WorkflowStatusCode.approved,
                    to: WorkflowStatusCode.done,
                },
                {
                    from: WorkflowStatusCode.done,
                    to: WorkflowStatusCode.review,
                },
                {
                    from: WorkflowStatusCode.review,
                    to: WorkflowStatusCode.closed,
                },
                {
                    from: WorkflowStatusCode.done,
                    to: WorkflowStatusCode.closed,
                },
            ],
        };
    }
}

export class Order extends Document<IOrder, IOrderDataSchema, IOrderWFSchema> {
    get dataSchema(): IOrderDataSchema {
        return {
            idFieldName: 'id',
            tableName: 'orders',
            relatedTablesPrefix: 'order_',
            fields: [
                { name: `userId`, type: 'bigint(20)', required: false, comment: '' },
                { name: `eateryId`, type: 'bigint(20)', comment: '' },
                { name: 'tableId', type: 'bigint(20)', comment: '' },
                { name: `discount`, type: 'float', comment: '' },
                { name: `comment`, type: 'varchar(2048)', comment: '' },
                { name: `esId`, type: 'varchar(1024)', required: false },
            ],
            related: [
                {
                    tableName: 'items',
                    idFieldName: 'id',
                    fields: [
                        { name: `name`, type: 'json', required: true },
                        { name: `description`, type: 'json', required: true },
                        { name: `tags`, type: 'json' },
                        { name: `option`, required: true, type: 'json' },
                        { name: `count`, type: 'float' },
                        { name: `comment`, type: 'varchar(1024)', required: false },
                        { name: `esId`, type: 'varchar(256)', required: false },
                    ],
                },
                {
                    tableName: 'payments',
                    idFieldName: 'id',
                    fields: paymentDataSchemaFields,
                },
            ],
        };
    }

    get wfSchema(): IOrderWFSchema {
        return {
            tableName: 'orders',
            initialState: WorkflowStatusCode.draft,
            transfers: [
                {
                    from: WorkflowStatusCode.draft,
                    to: WorkflowStatusCode.approved,
                },
                {
                    from: WorkflowStatusCode.approved,
                    to: WorkflowStatusCode.payed,
                },
                {
                    from: WorkflowStatusCode.draft,
                    to: WorkflowStatusCode.canceledByEatery,
                },
                {
                    from: WorkflowStatusCode.payed,
                    to: WorkflowStatusCode.done,
                },
                {
                    from: WorkflowStatusCode.done,
                    to: WorkflowStatusCode.review,
                },
                {
                    from: WorkflowStatusCode.review,
                    to: WorkflowStatusCode.closed,
                },
            ],
            related: [
                {
                    tableName: 'items',
                    initialState: WorkflowStatusCode.draft,
                    transfers: [
                        {
                            from: WorkflowStatusCode.draft,
                            to: WorkflowStatusCode.registered,
                        },
                        {
                            from: WorkflowStatusCode.registered,
                            to: WorkflowStatusCode.approved,
                        },
                        {
                            from: WorkflowStatusCode.registered,
                            to: WorkflowStatusCode.canceledByEatery,
                        },
                        {
                            from: WorkflowStatusCode.approved,
                            to: WorkflowStatusCode.done,
                        },
                        {
                            from: WorkflowStatusCode.done,
                            to: WorkflowStatusCode.review,
                        },
                        {
                            from: WorkflowStatusCode.review,
                            to: WorkflowStatusCode.closed,
                        },
                    ],
                },
                {
                    tableName: 'payments',
                    initialState: WorkflowStatusCode.draft,
                    transfers: paymentWFSchemaTransfers,
                },
            ],
        };
    }
}
