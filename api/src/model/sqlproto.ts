import { randomUUID, UUID } from 'crypto';
import mysql, { Connection, FieldPacket, QueryResult, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { mconsole } from './console';

export namespace Types {
    export type ObjectId = number;
}
export enum WorkflowErrorCode {
    unknown,
    abstract_method,
    sql_connection_error,
    sql_not_found,
    parameter_expected,
}
export class WorkflowError extends Error {
    code: WorkflowErrorCode;
    constructor(code: WorkflowErrorCode, message?: string) {
        super(message);
        this.code = code;
    }
    get json() {
        return {
            code: this.code,
            shortName: Object.values(WorkflowErrorCode)[this.code],
            message: this.message,
        }
    }
}

export enum WorkflowStatuses {
    "Draft",
    "Registered",
    "Approved",
    "Processing",
    "Done",
    "Review",
    "Closed"
}

export interface IWorkflowObject {
    id?: Types.ObjectId;
    blocked?: boolean;
    created?: Date;
    changed?: Date;
    createdByUser?: string;
    changedByUser?: string;
    wfStatus?: WorkflowStatuses;
}

export const WorkflowObjectBaseSchema: TableFieldSchema[] = [
    { name: `id`, sql: 'bigint(20) NOT NULL AUTO_INCREMENT' },
    { name: `blocked`, sql: 'tinyint(1) NOT NULL DEFAULT 0' },
    { name: `wfStatus`, sql: 'INT(11) NULL' },
    { name: `createdByUser`, sql: 'varchar(128) NULL' },
    { name: `changedByUser`, sql: 'varchar(128) NULL' },
    { name: `created`, sql: 'timestamp NOT NULL DEFAULT current_timestamp()' },
    { name: `changed`, sql: 'timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()' },
]

export type TableFieldSchema = {
    name: string;
    sql: string;
}

export type TableIndexSchema = {
    fields: string[];
    indexType: string;
}

export interface WorkflowObjectSchema {
    tableName: string;
    relatedTablesPrefix?: string;
    idFieldName: string;
    fields: TableFieldSchema[];
    indexes?: TableIndexSchema[];
    related?: WorkflowObjectSchema[];
}

export abstract class WorkflowObject<DataType extends IWorkflowObject, DBSchema extends WorkflowObjectSchema> {
    private static _sqlConnection?: Connection;
    protected _schema?: DBSchema;
    protected _id?: Types.ObjectId;
    protected _data?: DataType;
    protected _byUniqField?: {field: string, value: any};
    constructor(id: Types.ObjectId);
    constructor(data: DataType);
    constructor(field: string, uniqueValue: any);
    constructor(...arg: any[]) {
        switch (arg.length) {
            case 0:
                throw new WorkflowError(WorkflowErrorCode.unknown, `Couldn't create class '${this.constructor.name}' without data`)
            case 1: 
                if ((typeof arg[0] === 'object') && arg[0] !== undefined) { 
                    if (arg[0].id !== undefined) this._id = arg[0].id;
                    else this._id = undefined;
                    this._data = arg[0];
                } else {
                    this._id = arg[0];
                }
                break;
            case 2:
                this._byUniqField = {field: arg[0], value: arg[1]};
                break;
            default:
                throw new WorkflowError(WorkflowErrorCode.unknown, `Couldn't create class '${this.constructor.name}' too much data`)
        } 
    }

    get schema(): DBSchema {
        throw new WorkflowError(WorkflowErrorCode.unknown, `Abstract class '${this.constructor.name}' has no schema. Implement getter of 'schema' property`);
    }

    get sqlConnection(): Connection {
        if (WorkflowObject._sqlConnection === undefined) throw new WorkflowError(WorkflowErrorCode.sql_connection_error, 'Connection is undefined');
        return WorkflowObject._sqlConnection;
    }

    static async createSQLConnection(): Promise<Connection> {
        if (WorkflowObject._sqlConnection === undefined) {
            const db_name = process.env.db_name;
            const db_user = process.env.db_user;
            const db_pwd = process.env.db_pwd;
            const db_port = process.env.db_port === undefined ? undefined : parseInt(process.env.db_port);
            mconsole.sqlinfo(`Creating database connection: database: '${db_name}'; user: '${db_user}'; pwd: ${db_pwd ? "'******'" : "-"}; port: '${db_port}'`);
            WorkflowObject._sqlConnection = await mysql.createConnection({ database: db_name, user: db_user, password: db_pwd, port: db_port });
        }
        if (WorkflowObject._sqlConnection === undefined) throw new WorkflowError(WorkflowErrorCode.sql_connection_error, 'Unable to connect database');
        mconsole.sqlinfo(`Connection to database is successful!`);
        return WorkflowObject._sqlConnection;
    }

    get id(): Types.ObjectId | undefined {
        return this._id;
    }

    get data(): DataType {
        if (this._data === undefined) throw new WorkflowError(WorkflowErrorCode.abstract_method, `Object typeof '${this.constructor.name}' id = '${this._id}' has no data but used for active manipulation`);
        return this._data;
    }

    async save(): Promise<DataType> {
        await WorkflowObject.createSQLConnection();

        let schemaDefinedFields = this.schema.fields;
        let wfSchemaDefinedFields = WorkflowObjectBaseSchema;
        if (this._id === undefined) {
            schemaDefinedFields = this.schema.fields.filter(field => (this.data as any)[field.name] !== undefined);
            wfSchemaDefinedFields = WorkflowObjectBaseSchema.filter(field => (this.data as any)[field.name] !== undefined);
        }
        let sql: string;
        if (this._id === undefined)
            sql = `INSERT INTO \`${this.schema.tableName}\` (
        ${schemaDefinedFields.map(field => `\`${field.name}\``).join(",")}${wfSchemaDefinedFields.length !== 0 ? "," : ""}
        ${wfSchemaDefinedFields.map(field => `\`${field.name}\``).join(",")}
        ) VALUES (
        ${schemaDefinedFields.map(field => `?`).join(",")}${wfSchemaDefinedFields.length !== 0 ? "," : ""}
        ${wfSchemaDefinedFields.map(field => `?`).join(",")}
        )`;
        else
            sql = `UPDATE \`${this.schema.tableName}\`
        SET ${schemaDefinedFields.map(field => `\`${field.name}\` = ?`).join(",")}${wfSchemaDefinedFields.length !== 0 ? "," : ""} 
        ${wfSchemaDefinedFields.map(field => `\`${field.name}\` = ?`).join(",")}
        WHERE \`${this.schema.idFieldName}\` = ?`
        const params = [...schemaDefinedFields.map(field => (this.data as any)[field.name]), ...wfSchemaDefinedFields.map(field => (this.data as any)[field.name])];
        if (this._id !== undefined) params.push(this._id);
        mconsole.sqlq(sql, params);

        //checking structure by schema
        for (const [propName, propValue] of Object.entries(this.data)) {
            if (-1 === this.schema.fields.findIndex(field => field.name === propName)
                && -1 === this.schema.related?.findIndex(relObj => relObj.tableName === propName)
                && -1 === WorkflowObjectBaseSchema.findIndex(field => field.name === propName)
            ) console.warn(`Property '${propName}' is absent in schema of '${this.schema.tableName}'`);
        }
        /*for (const field of this.schema.fields) {
            if (!(field.name in this.data)) console.warn(`Field '${field.name}' of schema '${this.schema.tableName}' is absent in interface of ${this.constructor.name}`);
        }*/

        await this.sqlConnection.beginTransaction();
        //insert main record
        while (true) {
            try {
                const [sh, fields] = await this.sqlConnection.query<ResultSetHeader>(sql, params);
                mconsole.sqld(sh, fields);
                if (this._id === undefined) this._id = sh.insertId;
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
        if (this.schema.related !== undefined) {
            for (const relObj of this.schema.related) {
                if (relObj.tableName in this.data) {
                    const arrProp = (this.data as any)[relObj.tableName];
                    for (const element of arrProp) {
                        let schemaDefinedFields = relObj.fields;
                        let wfSchemaDefinedFields = WorkflowObjectBaseSchema;
                        if (element[relObj.idFieldName] === undefined) {
                            schemaDefinedFields = relObj.fields.filter(field => (element as any)[field.name] !== undefined);
                            wfSchemaDefinedFields = WorkflowObjectBaseSchema.filter(field => (element as any)[field.name] !== undefined);
                        }

                        if (element[relObj.idFieldName] === undefined)
                            sql = `INSERT INTO \`${this.schema.relatedTablesPrefix + relObj.tableName}\`(
                            \`${this.schema.relatedTablesPrefix + relObj.idFieldName}\`,
                            ${schemaDefinedFields.map(field => `\`${field.name}\``).join(",")}${wfSchemaDefinedFields.length !== 0 ? "," : ""}
                            ${wfSchemaDefinedFields.map(field => `\`${field.name}\``).join(",")}
                            ) VALUES (
                            ?,
                            ${schemaDefinedFields.map(field => `?`).join(",")}${wfSchemaDefinedFields.length !== 0 ? "," : ""}
                            ${wfSchemaDefinedFields.map(field => `?`).join(",")}
                            )`;
                        else
                            sql = `UPDATE \`${this.schema.relatedTablesPrefix + relObj.tableName}\`
                            SET \`${this.schema.relatedTablesPrefix + relObj.idFieldName}\` = ?,
                            ${schemaDefinedFields.map(field => `\`${field.name}\` = ?`).join(",")}${wfSchemaDefinedFields.length !== 0 ? "," : ""} 
                            ${wfSchemaDefinedFields.map(field => `\`${field.name}\` = ?`).join(",")}
                            WHERE \`${relObj.idFieldName}\` = ?`
                        const params = [this._id, ...schemaDefinedFields.map(field => (element as any)[field.name]), ...wfSchemaDefinedFields.map(field => (element as any)[field.name])];
                        if (element[relObj.idFieldName] !== undefined) params.push(element[relObj.idFieldName]);
                        mconsole.sqlq(sql, params);
                        while (true) {
                            try {
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
        mconsole.sqlinfo(`Creating main table of schema '${this.schema.tableName}'`);
        let sql = `CREATE TABLE IF NOT EXISTS \`${this.schema.tableName}\`(
        ${this.schema.fields.map(field => `\`${field.name}\` ${field.sql}`).join(",")}, 
        ${WorkflowObjectBaseSchema.map(field => `\`${field.name}\` ${field.sql}`).join(",")}, 
        PRIMARY KEY (\`${this.schema.idFieldName}\`)) 
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;
        mconsole.sqlq(`sql = '${sql}'`, []);
        await this.sqlConnection.query(sql);
        if (this.schema.indexes !== undefined) for (const key of this.schema.indexes) {
            sql = `ALTER TABLE \`${this.schema.tableName}\` ADD ${key.indexType} (${key.fields.map(field=>`\`${field}\``).join(",")});`;
            mconsole.sqlq(`sql = '${sql}'`, []);
            await this.sqlConnection.query(sql);
            mconsole.sqlinfo(`Index of '${this.schema.tableName}' has created successfully`);
        }
        mconsole.sqlinfo(`Main table of schema '${this.schema.tableName}' has created successfully`);
    }

    protected async createRelatedTable(tableSchema: WorkflowObjectSchema) {
        mconsole.sqlinfo(`Creating related table '${tableSchema.tableName}' of schema '${this.schema.tableName}'`);

        let sql = `
        CREATE TABLE IF NOT EXISTS \`${this.schema.relatedTablesPrefix + tableSchema.tableName}\`(
        \`${this.schema.relatedTablesPrefix + this.schema.idFieldName}\` bigint(20) NOT NULL,
        ${tableSchema.fields.map(field => `\`${field.name}\` ${field.sql}`).join(",")}, 
        ${WorkflowObjectBaseSchema.map(field => `\`${field.name}\` ${field.sql}`).join(",")}, 
        PRIMARY KEY (\`${tableSchema.idFieldName}\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;
        mconsole.sqlq(`sql = '${sql}'`, []);
        await this.sqlConnection.query(sql);
        mconsole.sqlinfo(`Related table '${tableSchema.tableName}' of schema '${this.schema.tableName}' has created successfully`);

        if (tableSchema.indexes !== undefined) for (const key of tableSchema.indexes) {
            sql = `ALTER TABLE \`${this.schema.relatedTablesPrefix + tableSchema.tableName}\` ADD ${key.indexType} (${key.fields.map(field=>`\`${field}\``).join(",")});`;
            mconsole.sqlq(`sql = '${sql}'`, []);
            await this.sqlConnection.query(sql);
            mconsole.sqlinfo(`Index of '${this.schema.relatedTablesPrefix + tableSchema.tableName}' has created successfully`);
        }

        mconsole.sqlinfo(`Creating foreign key for related table ${tableSchema.tableName}' of schema '${this.schema.tableName}'`);
        sql = `
        ALTER TABLE \`${this.schema.relatedTablesPrefix + tableSchema.tableName}\` 
        ADD FOREIGN KEY (\`${this.schema.relatedTablesPrefix}${this.schema.idFieldName}\`) REFERENCES \`${this.schema.tableName}\`(\`${this.schema.idFieldName}\`) 
        ON DELETE RESTRICT ON UPDATE RESTRICT;`
        mconsole.sqlq(`sql = '${sql}'`, []);
        await this.sqlConnection.query(sql);
        mconsole.sqlinfo(`Foreign key for related table ${tableSchema.tableName}' of schema '${this.schema.tableName}' has created successfully`);
    }

    protected async loadFromDB(): Promise<DataType> {
        await WorkflowObject.createSQLConnection();
        let [rows, fields]: [DataType[], FieldPacket[]] = [[], []];
        if (this.id === undefined) {
            if (this._byUniqField === undefined) throw new WorkflowError(WorkflowErrorCode.parameter_expected, `Unique value of object '${this.constructor.name}' is undefined and id is undefined too`);

            const sql = `SELECT \`id\` from \`${this.schema.tableName}\` WHERE \`${this._byUniqField.field}\` = ?`;
            mconsole.sqlq(sql, [this._byUniqField.value]);
            [rows, fields] = await this.sqlConnection.query<[]>(sql, [this._byUniqField.value]);
            if (rows.length === 1) this._id = rows[0].id;
            else throw new WorkflowError(WorkflowErrorCode.sql_not_found, `There're ${rows.length} of records in '${this.schema.tableName}'. Searched value '${this._byUniqField.value}' by field '${this._byUniqField.field}' Expected: 1`);
            mconsole.sqld(`Found only id = '${this._id}' in ${this.schema.tableName} by field '${this._byUniqField.field}' = '${this._byUniqField.value}' `);
        }
        while (true) {
            try {
                [rows, fields] = await this.sqlConnection.query<[]>(`select * from \`${this.schema.tableName}\` where \`${this.schema.idFieldName}\` = ?`, [this.id]);
                break;
            } catch (e: any) {
                if (e.code === 'ER_NO_SUCH_TABLE') {
                    await this.createMainTable();
                } else {
                    throw e;
                }
            }
        }
        if (rows.length === 1) {
            const parentObj = rows[0];
            if (this.schema.related !== undefined) {
                for (const relObj of this.schema.related) {
                    let [rows, fields]: [any[], FieldPacket[]] = [[], []];
                    while (true) {
                        try {
                            [rows, fields] = await this.sqlConnection.query<any[]>(`
                                select * 
                                from \`${this.schema.relatedTablesPrefix + relObj.tableName}\` 
                                where \`${this.schema.relatedTablesPrefix + relObj.idFieldName}\` = ?`, [this.id]);
                            (parentObj as any)[relObj.tableName] = rows;
                            break;
                        } catch (e: any) {
                            if (e.code === 'ER_NO_SUCH_TABLE') {
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
            throw new WorkflowError(WorkflowErrorCode.sql_not_found, `Object '${this.constructor.name}' with id = '${this.id}' not found`);
        }
    }

    async changeWorkflowStatus(newStatus: WorkflowStatuses) {

    }
}
