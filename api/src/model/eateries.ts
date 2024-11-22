import { randomUUID, UUID } from 'crypto';
import mysql, { Connection, FieldPacket, QueryResult, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export namespace Types {
    export type ObjectId = number;
}

interface ITimeSlot {

}

enum WorkflowStatuses {
    
    "Booking:Draft",

    "Employee:Draft",
    
    /** */
    "Eatery:Draft",
}

interface IWorkflowObject {
    id?: Types.ObjectId;
    blocked?: boolean;
    created?: Date;
    changed?: Date;
    createdByUser?: string;
    changedByUser?: string;
    wfStatus?: WorkflowStatuses;
}

const WorkflowObjectBaseSchema: TableFieldSchema[] = [
    {name: `id`, sql: 'bigint(20) NOT NULL AUTO_INCREMENT'},
    {name: `blocked`, sql: 'tinyint(1) NOT NULL DEFAULT 0'},
    {name: `wfStatus`, sql: 'INT(11) NULL'},
    {name: `createdByUser`, sql: 'varchar(128) NULL'},
    {name: `changedByUser`, sql: 'varchar(128) NULL'},
    {name: `created`, sql: 'timestamp NOT NULL DEFAULT current_timestamp()'},
    {name: `changed`, sql: 'timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()'},
]

type TableFieldSchema = {
    name: string;
    sql: string;
}

interface WorkflowObjectSchema {
    tableName: string;
    relatedTablesPrefix?: string;
    idFieldName: string;
    fields: TableFieldSchema[];
    related?: WorkflowObjectSchema[];
}

abstract class WorkflowObject <DataType extends IWorkflowObject, DBSchema extends WorkflowObjectSchema> {

    private static _sqlConnection?: Connection;
    protected _schema?: DBSchema;
    protected _id?: Types.ObjectId;
    protected _data?: DataType;
    constructor(id: Types.ObjectId);
    constructor(data: DataType);
    constructor(id: Types.ObjectId, data?: DataType) {
        if (id === undefined && data === undefined){
            this._data = this.generateNewElement();
        } else {
            if (typeof id === 'object') data = id;
            if (data !== undefined) {
                if (data?.id !== undefined) this._id = data.id;
                else this._id = undefined;
                this._data = data;
            } else {
                this._id = id;
            }
        }
    }

    get schema(): DBSchema {
        throw Error(`Abstract class '${this.constructor.name}' has no schema. Implement getter of 'schema' property`);
    }

    get sqlConnection(): Connection {
        if (WorkflowObject._sqlConnection === undefined) throw Error('Connection is undefined');
        return WorkflowObject._sqlConnection;
    }

    static async createSQLConnection(): Promise<Connection> {
        if (WorkflowObject._sqlConnection === undefined) {
            const db_name = process.env.db_name;
            const db_user = process.env.db_user;
            const db_pwd = process.env.db_pwd;
            const db_port = process.env.db_port === undefined?undefined:parseInt(process.env.db_port);
            console.log(`Creating database connection: database: '${db_name}'; user: '${db_user}'; pwd: ${db_pwd?"'******'":"-"}; port: '${db_port}'`);
            WorkflowObject._sqlConnection = await mysql.createConnection({database: db_name, user: db_user, password: db_pwd, port: db_port});
        }
        if (WorkflowObject._sqlConnection === undefined) throw new Error('Unable to connect database');
        console.log(`Connection to database is successful!`);
        return WorkflowObject._sqlConnection;
    }

    get id(): Types.ObjectId | undefined {
        return this._id;
    }

    get data(): DataType {
        if (this._data === undefined) throw new Error(`Object typeof '${this.constructor.name}' id = '${this._id}' has no data but used for active manipulation`);
        return this._data;
    }

    async save(): Promise<DataType> {
        await WorkflowObject.createSQLConnection();

        const schemaDefinedFields = this.schema.fields.filter(field=>(this.data as any)[field.name]!== undefined);
        const wfSchemaDefinedFields = WorkflowObjectBaseSchema.filter(field=>(this.data as any)[field.name]!== undefined);
        const sql = `INSERT INTO \`${this.schema.tableName}\` (
        ${schemaDefinedFields.map(field=>`\`${field.name}\``).join(",")}${wfSchemaDefinedFields.length !== 0?",":""}
        ${wfSchemaDefinedFields.map(field=>`\`${field.name}\``).join(",")}
        ) VALUES (
        ${schemaDefinedFields.map(field=>`?`).join(",")}${wfSchemaDefinedFields.length !== 0?",":""}
        ${wfSchemaDefinedFields.map(field=>`?`).join(",")}
        )`;
        const params = [...schemaDefinedFields.map(field=>(this.data as any)[field.name]), ...wfSchemaDefinedFields.map(field=>(this.data as any)[field.name])];
        if (!process.env.PROD) console.log(`sql = '${sql}', params = '${params}'`);

        if (!process.env.PROD) {
            //checking structure by schema
            for (const [propName, propValue] of Object.entries(this.data)) {
                if (-1 === this.schema.fields.findIndex(field=>field.name === propName) 
                    && -1 === this.schema.related?.findIndex(relObj=>relObj.tableName === propName)) console.warn(`Property '${propName}' is absent in schema of '${this.schema.tableName}'`);
            }
            for (const field of this.schema.fields) {
                if (!(field.name in this.data)) console.warn(`Field '${field.name}' of schema '${this.schema.tableName}' is absent in interface of ${this.constructor.name}`);
            }
        }

        await this.sqlConnection.beginTransaction();
        //insert main record
        while (true) {
            try{
                const [sh, fields] = await this.sqlConnection.query<ResultSetHeader>(sql, params);
                console.log(sh, fields);
                this._id = sh.insertId;
                break;
            } catch (e: any) {
                if (e.code === 'ER_NO_SUCH_TABLE') {
                    await this.createMainTable();
                } else {
                    await this.sqlConnection.rollback();
                    throw e;
                }
            }
        }
        if (this.schema.related !== undefined){
            for (const relObj of this.schema.related) {
                if (relObj.tableName in this.data) {
                    const arrProp = (this.data as any)[relObj.tableName];
                    for (const element of arrProp) {
                        console.log(element);
                        const schemaDefinedFields = relObj.fields.filter(field=>(element as any)[field.name]!== undefined);
                        const wfSchemaDefinedFields = WorkflowObjectBaseSchema.filter(field=>(element as any)[field.name]!== undefined);
                        const sql = `INSERT INTO \`${this.schema.relatedTablesPrefix+relObj.tableName}\`(
                            \`${this.schema.relatedTablesPrefix+relObj.idFieldName}\`,
                            ${schemaDefinedFields.map(field=>`\`${field.name}\``).join(",")}${wfSchemaDefinedFields.length !== 0?",":""}
                            ${wfSchemaDefinedFields.map(field=>`\`${field.name}\``).join(",")}
                            ) VALUES (
                            ?,
                            ${schemaDefinedFields.map(field=>`?`).join(",")}${wfSchemaDefinedFields.length !== 0?",":""}
                            ${wfSchemaDefinedFields.map(field=>`?`).join(",")}
                            )`;
                        const params = [this._id, ...schemaDefinedFields.map(field=>(element as any)[field.name]), ...wfSchemaDefinedFields.map(field=>(element as any)[field.name])];
                        console.log(sql, params);
                        while (true) {
                            try{
                                await this.sqlConnection.query<ResultSetHeader>(sql, params);
                                break;
                            } catch (e: any) {
                                if (e.code === 'ER_NO_SUCH_TABLE') {
                                    await this.createRelatedTable(relObj);
                                } else {
                                    await this.sqlConnection.rollback();
                                    throw e;
                                }
                            }
                        }
                    }
                } else {
                    console.warn(`Property ${relObj.tableName} not found`);
                }
            }
        } 
        await this.sqlConnection.commit();
        await this.load();
        return this.data;
    }

    async load(data?: DataType) {
        if (data !== undefined) {
            this._data = data;
            this._id = this._data.id;
        } else {
            const ou: DataType = await this.loadFromDB();
            this.load(ou);
        }
    }

    protected async createMainTable() {
        console.log(`Creating main table of schema '${this.schema.tableName}'`);
        const sql = `CREATE TABLE IF NOT EXISTS \`${this.schema.tableName}\`(
        ${this.schema.fields.map(field=>`\`${field.name}\` ${field.sql}`).join(",")}, 
        ${WorkflowObjectBaseSchema.map(field=>`\`${field.name}\` ${field.sql}`).join(",")}, 
        PRIMARY KEY (\`${this.schema.idFieldName}\`)) 
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;
        console.log(`sql = '${sql}'`);
        await this.sqlConnection.query(sql);
        console.log(`Main table of schema '${this.schema.tableName}' has created successfully`);
    }

    protected async createRelatedTable(tableSchema: WorkflowObjectSchema) {
        console.log(`Creating related table '${tableSchema.tableName}' of schema '${this.schema.tableName}'`);
        
        let sql = `
        CREATE TABLE IF NOT EXISTS \`${this.schema.relatedTablesPrefix+tableSchema.tableName}\`(

        ${tableSchema.fields.map(field=>`\`${field.name}\` ${field.sql}`).join(",")}, 
        ${WorkflowObjectBaseSchema.map(field=>`\`${field.name}\` ${field.sql}`).join(",")}, 
        PRIMARY KEY (\`${tableSchema.idFieldName}\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;
        console.log(`sql = '${sql}'`);
        await this.sqlConnection.query(sql);
        console.log(`Related table '${tableSchema.tableName}' of schema '${this.schema.tableName}' has created successfully`);

        console.log(`Creating foreign key for related table ${tableSchema.tableName}' of schema '${this.schema.tableName}'`);
        sql = `
        ALTER TABLE \`${this.schema.relatedTablesPrefix+tableSchema.tableName}\` 
        ADD FOREIGN KEY (\`${this.schema.relatedTablesPrefix}${this.schema.idFieldName}\`) REFERENCES \`${this.schema.tableName}\`(\`${this.schema.idFieldName}\`) 
        ON DELETE RESTRICT ON UPDATE RESTRICT;`
        console.log(`sql = '${sql}'`);
        await this.sqlConnection.query(sql);
        console.log(`Foreign key for related table ${tableSchema.tableName}' of schema '${this.schema.tableName}' has created successfully`);
    }

    protected async loadFromDB(): Promise<DataType> {    
        await WorkflowObject.createSQLConnection();
        let [rows, fields]: [DataType[], FieldPacket[]] = [[],[]];
        while (true) {
            try {
                [rows, fields] = await this.sqlConnection.query<[]>(`select * from \`${this.schema.tableName}\` where \`${this.schema.idFieldName}\` = ?`, [this.id]);
                break;
            } catch(e: any) {
                if(e.code === 'ER_NO_SUCH_TABLE') {
                    await this.createMainTable();
                } else {
                    throw e;
                }
            }
        }
        if (rows.length === 1) {
            const parentObj = rows[0];
            if (this.schema.related !== undefined){
                for (const relObj of this.schema.related) {
                    let [rows, fields]: [any[], FieldPacket[]] = [[], []];
                    while (true) {
                        try {
                            [rows, fields] = await this.sqlConnection.query<any[]>(`
                                select * 
                                from \`${this.schema.relatedTablesPrefix+relObj.tableName}\` 
                                where \`${this.schema.relatedTablesPrefix+relObj.idFieldName}\` = ?`, [this.id]);
                            (parentObj as any)[relObj.tableName] = rows;
                            break;
                        } catch (e: any) {
                            if(e.code === 'ER_NO_SUCH_TABLE') {
                                this.createRelatedTable(relObj)
                            } else {
                                throw e;
                            }
                        }
                    }
                }
            }
            return parentObj;
        } else {
            throw Error (`Object '${this.constructor.name}' with id = '${this.id}' not found`);
        }
    }

    protected generateNewElement(): DataType {
        return {
            created: new Date(),
        } as DataType;
    }
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
}

export class Eatery extends WorkflowObject<IEatery, IEaterySchema> {
    get schema(): IEaterySchema {
        return {
            idFieldName: "id",
            tableName: "eateries",
            relatedTablesPrefix: "eatery_",
            fields: [
                {name:`name`, sql:'varchar(1024) NOT NULL'},
                {name:`rating`, sql:'float DEFAULT NULL'},
                {name:`url`, sql:'varchar(2048) DEFAULT NULL'},
                {name:`photos`, sql:'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`))'},
                {name:`descriptions`, sql:'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`descriptions`))'},
                {name:`tags`, sql:'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`))'},
                {name:`cuisines`, sql:'longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`cuisines`))'},
                {name:`avgbillwoalcohol`, sql:'float DEFAULT NULL'},
            ], 
            related: [
                {
                    tableName: 'tables',
                    idFieldName: "id",
                    fields: [
                    {name:`eatery_id`, sql: 'bigint(20) NOT NULL'},
                    {name:`name`, sql:'varchar(1024) NOT NULL'},
                    {name:`rating`, sql:'float DEFAULT NULL'},
                ]}
            ]
        };
    }
}

/**
 * 
 */
interface IEmployee extends IWorkflowObject {
    login: number | string;     /**Telegram ID or login or phone */
    hash: string;               /** */
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

interface ITable {
    name: string;
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

interface IEaterySchema extends WorkflowObjectSchema{

}
