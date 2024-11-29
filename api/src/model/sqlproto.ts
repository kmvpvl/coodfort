import { randomUUID, UUID } from 'crypto';
import mysql, { Connection, FieldPacket, QueryResult, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { mconsole } from './console';

export namespace Types {
    export type ObjectId = number;
}
export enum DocumentErrorCode {
    unknown,
    abstract_method,
    sql_connection_error,
    sql_not_found,
    parameter_expected,
}
export class DocumentError extends Error {
    code: DocumentErrorCode;
    constructor(code: DocumentErrorCode, message?: string) {
        super(message);
        this.code = code;
    }
    get json() {
        return {
            code: this.code,
            shortName: Object.values(DocumentErrorCode)[this.code],
            message: this.message,
        }
    }
}

export enum WorkflowStatus {
    "Draft",
    "Registered",
    "Approved",
    "Processing",
    "Done",
    "Review",
    "Closed",
}

export interface IDocument {
    id?: Types.ObjectId;
    blocked?: boolean;
    created?: Date;
    changed?: Date;
    createdByUser?: string;
    changedByUser?: string;
    wfStatus?: WorkflowStatus;
}

export const DocumentBaseSchema: TableFieldSchema[] = [
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

export interface DocumentDataSchema {
    tableName: string;
    relatedTablesPrefix?: string;
    idFieldName: string;
    fields: TableFieldSchema[];
    indexes?: TableIndexSchema[];
    related?: DocumentDataSchema[];
}

export type DocumentWFSchema = {
    initialState: WorkflowStatus;
    transfers?: {
        from: WorkflowStatus,
        to: WorkflowStatus
    }[]
}

export abstract class Document<DataType extends IDocument, DBSchema extends DocumentDataSchema, WFSchema extends DocumentWFSchema> {
    private static _sqlConnection?: Connection;
    protected _dataSchema?: DBSchema;
    protected _id?: Types.ObjectId;
    protected _data?: DataType;
    protected _byUniqField?: { field: string, value: any };
    constructor(id: Types.ObjectId);
    constructor(data: DataType);
    constructor(field: string, uniqueValue: any);
    constructor(...arg: any[]) {
        switch (arg.length) {
            case 0:
                throw new DocumentError(DocumentErrorCode.unknown, `Couldn't create class '${this.constructor.name}' without data`)
            case 1:
                if ((typeof arg[0] === 'object') && arg[0] !== undefined) {
                    if (arg[0].id !== undefined) this._id = arg[0].id;
                    else this._id = undefined;
                    this._data = arg[0];
                    if (this._id === undefined && this._data !== undefined) this._data.wfStatus = this.wfSchema.initialState;
                } else {
                    this._id = arg[0];
                }
                break;
            case 2:
                this._byUniqField = { field: arg[0], value: arg[1] };
                break;
            default:
                throw new DocumentError(DocumentErrorCode.unknown, `Couldn't create class '${this.constructor.name}' too much data`)
        }
    }

    get dataSchema(): DBSchema {
        throw new DocumentError(DocumentErrorCode.unknown, `Abstract class '${this.constructor.name}' has no data schema. Implement getter of 'dataSchema' property`);
    }

    get wfSchema(): WFSchema {
        throw new DocumentError(DocumentErrorCode.unknown, `Abstract class '${this.constructor.name}' has no workflow schema. Implement getter of 'wfSchema' property`);
    }

    get sqlConnection(): Connection {
        if (Document._sqlConnection === undefined) throw new DocumentError(DocumentErrorCode.sql_connection_error, 'Connection is undefined');
        return Document._sqlConnection;
    }

    static async createSQLConnection(): Promise<Connection> {
        if (Document._sqlConnection === undefined) {
            const db_name = process.env.db_name;
            const db_user = process.env.db_user;
            const db_pwd = process.env.db_pwd;
            const db_port = process.env.db_port === undefined ? undefined : parseInt(process.env.db_port);
            mconsole.sqlinfo(`Creating database connection: database: '${db_name}'; user: '${db_user}'; pwd: ${db_pwd ? "'******'" : "-"}; port: '${db_port}'`);
            Document._sqlConnection = await mysql.createConnection({ database: db_name, user: db_user, password: db_pwd, port: db_port });
        }
        if (Document._sqlConnection === undefined) throw new DocumentError(DocumentErrorCode.sql_connection_error, 'Unable to connect database');
        mconsole.sqlinfo(`Connection to database is successful!`);
        return Document._sqlConnection;
    }

    get id(): Types.ObjectId | undefined {
        return this._id;
    }

    get data(): DataType {
        if (this._data === undefined) throw new DocumentError(DocumentErrorCode.abstract_method, `Object typeof '${this.constructor.name}' id = '${this._id}' has no data but used for active manipulation`);
        return this._data;
    }

    async save(): Promise<DataType> {
        await Document.createSQLConnection();

        let schemaDefinedFields = this.dataSchema.fields;
        let wfSchemaDefinedFields = DocumentBaseSchema;
        if (this._id === undefined) {
            schemaDefinedFields = this.dataSchema.fields.filter(field => (this.data as any)[field.name] !== undefined);
            wfSchemaDefinedFields = DocumentBaseSchema.filter(field => (this.data as any)[field.name] !== undefined);
        }
        let sql: string;
        if (this._id === undefined)
            sql = `INSERT INTO \`${this.dataSchema.tableName}\` (
        ${schemaDefinedFields.map(field => `\`${field.name}\``).join(",")}${wfSchemaDefinedFields.length !== 0 ? "," : ""}
        ${wfSchemaDefinedFields.map(field => `\`${field.name}\``).join(",")}
        ) VALUES (
        ${schemaDefinedFields.map(field => `?`).join(",")}${wfSchemaDefinedFields.length !== 0 ? "," : ""}
        ${wfSchemaDefinedFields.map(field => `?`).join(",")}
        )`;
        else
            sql = `UPDATE \`${this.dataSchema.tableName}\`
        SET ${schemaDefinedFields.map(field => `\`${field.name}\` = ?`).join(",")}${wfSchemaDefinedFields.length !== 0 ? "," : ""} 
        ${wfSchemaDefinedFields.map(field => `\`${field.name}\` = ?`).join(",")}
        WHERE \`${this.dataSchema.idFieldName}\` = ?`
        const params = [...schemaDefinedFields.map(field => (this.data as any)[field.name]), ...wfSchemaDefinedFields.map(field => (this.data as any)[field.name])];
        if (this._id !== undefined) params.push(this._id);
        mconsole.sqlq(sql, params);

        //checking structure by schema
        for (const [propName, propValue] of Object.entries(this.data)) {
            if (-1 === this.dataSchema.fields.findIndex(field => field.name === propName)
                && -1 === this.dataSchema.related?.findIndex(relObj => relObj.tableName === propName)
                && -1 === DocumentBaseSchema.findIndex(field => field.name === propName)
            ) console.warn(`Property '${propName}' is absent in schema of '${this.dataSchema.tableName}'`);
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
        if (this.dataSchema.related !== undefined) {
            for (const relObj of this.dataSchema.related) {
                if (relObj.tableName in this.data) {
                    const arrProp = (this.data as any)[relObj.tableName];
                    for (const element of arrProp) {
                        let schemaDefinedFields = relObj.fields;
                        let wfSchemaDefinedFields = DocumentBaseSchema;
                        if (element[relObj.idFieldName] === undefined) {
                            schemaDefinedFields = relObj.fields.filter(field => (element as any)[field.name] !== undefined);
                            wfSchemaDefinedFields = DocumentBaseSchema.filter(field => (element as any)[field.name] !== undefined);
                        }

                        if (element[relObj.idFieldName] === undefined)
                            sql = `INSERT INTO \`${this.dataSchema.relatedTablesPrefix + relObj.tableName}\`(
                            \`${this.dataSchema.relatedTablesPrefix + relObj.idFieldName}\`,
                            ${schemaDefinedFields.map(field => `\`${field.name}\``).join(",")}${wfSchemaDefinedFields.length !== 0 ? "," : ""}
                            ${wfSchemaDefinedFields.map(field => `\`${field.name}\``).join(",")}
                            ) VALUES (
                            ?,
                            ${schemaDefinedFields.map(field => `?`).join(",")}${wfSchemaDefinedFields.length !== 0 ? "," : ""}
                            ${wfSchemaDefinedFields.map(field => `?`).join(",")}
                            )`;
                        else
                            sql = `UPDATE \`${this.dataSchema.relatedTablesPrefix + relObj.tableName}\`
                            SET \`${this.dataSchema.relatedTablesPrefix + relObj.idFieldName}\` = ?,
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
        mconsole.sqlinfo(`Creating main table of schema '${this.dataSchema.tableName}'`);
        let sql = `CREATE TABLE IF NOT EXISTS \`${this.dataSchema.tableName}\`(
        ${this.dataSchema.fields.map(field => `\`${field.name}\` ${field.sql}`).join(",")}, 
        ${DocumentBaseSchema.map(field => `\`${field.name}\` ${field.sql}`).join(",")}, 
        PRIMARY KEY (\`${this.dataSchema.idFieldName}\`)) 
        ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;
        mconsole.sqlq(`sql = '${sql}'`, []);
        await this.sqlConnection.query(sql);
        if (this.dataSchema.indexes !== undefined) for (const key of this.dataSchema.indexes) {
            sql = `ALTER TABLE \`${this.dataSchema.tableName}\` ADD ${key.indexType} (${key.fields.map(field => `\`${field}\``).join(",")});`;
            mconsole.sqlq(`sql = '${sql}'`, []);
            await this.sqlConnection.query(sql);
            mconsole.sqlinfo(`Index of '${this.dataSchema.tableName}' has created successfully`);
        }
        mconsole.sqlinfo(`Main table of schema '${this.dataSchema.tableName}' has created successfully`);
    }

    protected async createRelatedTable(tableSchema: DocumentDataSchema) {
        mconsole.sqlinfo(`Creating related table '${tableSchema.tableName}' of schema '${this.dataSchema.tableName}'`);

        let sql = `
        CREATE TABLE IF NOT EXISTS \`${this.dataSchema.relatedTablesPrefix + tableSchema.tableName}\`(
        \`${this.dataSchema.relatedTablesPrefix + this.dataSchema.idFieldName}\` bigint(20) NOT NULL,
        ${tableSchema.fields.map(field => `\`${field.name}\` ${field.sql}`).join(",")}, 
        ${DocumentBaseSchema.map(field => `\`${field.name}\` ${field.sql}`).join(",")}, 
        PRIMARY KEY (\`${tableSchema.idFieldName}\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;
        mconsole.sqlq(`sql = '${sql}'`, []);
        await this.sqlConnection.query(sql);
        mconsole.sqlinfo(`Related table '${tableSchema.tableName}' of schema '${this.dataSchema.tableName}' has created successfully`);

        if (tableSchema.indexes !== undefined) for (const key of tableSchema.indexes) {
            sql = `ALTER TABLE \`${this.dataSchema.relatedTablesPrefix + tableSchema.tableName}\` ADD ${key.indexType} (${key.fields.map(field => `\`${field}\``).join(",")});`;
            mconsole.sqlq(`sql = '${sql}'`, []);
            await this.sqlConnection.query(sql);
            mconsole.sqlinfo(`Index of '${this.dataSchema.relatedTablesPrefix + tableSchema.tableName}' has created successfully`);
        }

        mconsole.sqlinfo(`Creating foreign key for related table ${tableSchema.tableName}' of schema '${this.dataSchema.tableName}'`);
        sql = `
        ALTER TABLE \`${this.dataSchema.relatedTablesPrefix + tableSchema.tableName}\` 
        ADD FOREIGN KEY (\`${this.dataSchema.relatedTablesPrefix}${this.dataSchema.idFieldName}\`) REFERENCES \`${this.dataSchema.tableName}\`(\`${this.dataSchema.idFieldName}\`) 
        ON DELETE RESTRICT ON UPDATE RESTRICT;`
        mconsole.sqlq(`sql = '${sql}'`, []);
        await this.sqlConnection.query(sql);
        mconsole.sqlinfo(`Foreign key for related table ${tableSchema.tableName}' of schema '${this.dataSchema.tableName}' has created successfully`);
    }

    protected async loadFromDB(): Promise<DataType> {
        await Document.createSQLConnection();
        let [rows, fields]: [DataType[], FieldPacket[]] = [[], []];
        if (this.id === undefined) {
            if (this._byUniqField === undefined) throw new DocumentError(DocumentErrorCode.parameter_expected, `Unique value of object '${this.constructor.name}' is undefined and id is undefined too`);

            const sql = `SELECT \`id\` from \`${this.dataSchema.tableName}\` WHERE \`${this._byUniqField.field}\` = ?`;
            mconsole.sqlq(sql, [this._byUniqField.value]);
            [rows, fields] = await this.sqlConnection.query<[]>(sql, [this._byUniqField.value]);
            if (rows.length === 1) this._id = rows[0].id;
            else throw new DocumentError(DocumentErrorCode.sql_not_found, `There're ${rows.length} of records in '${this.dataSchema.tableName}'. Searched value '${this._byUniqField.value}' by field '${this._byUniqField.field}' Expected: 1`);
            mconsole.sqld(`Found only id = '${this._id}' in ${this.dataSchema.tableName} by field '${this._byUniqField.field}' = '${this._byUniqField.value}' `);
        }
        while (true) {
            try {
                [rows, fields] = await this.sqlConnection.query<[]>(`select * from \`${this.dataSchema.tableName}\` where \`${this.dataSchema.idFieldName}\` = ?`, [this.id]);
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
            if (this.dataSchema.related !== undefined) {
                for (const relObj of this.dataSchema.related) {
                    let [rows, fields]: [any[], FieldPacket[]] = [[], []];
                    while (true) {
                        try {
                            [rows, fields] = await this.sqlConnection.query<any[]>(`
                                select * 
                                from \`${this.dataSchema.relatedTablesPrefix + relObj.tableName}\` 
                                where \`${this.dataSchema.relatedTablesPrefix + relObj.idFieldName}\` = ?`, [this.id]);
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
            throw new DocumentError(DocumentErrorCode.sql_not_found, `Object '${this.constructor.name}' with id = '${this.id}' not found`);
        }
    }

    async changeWorkflowStatus(newStatus: WorkflowStatus) {

    }
}
