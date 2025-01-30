import { DocumentErrorCode, IDocument, Types, WorkflowStatusCode } from '../types/prototypes';
import { Document, DocumentError, IDocumentDataSchema, IDocumentWFSchema } from './protodocument';
import { IUser } from '../types/prototypes';
import { createHmac } from 'crypto';
import { Eatery, Order } from './eatery';
import { EateryRoleCode, IEatery, IEateryBrief, IMealRow, IMenuRow, IOrderRow } from '../types/eaterytypes';
import { mconsole } from './console';
import { Meal, Menu } from './meal';
import { IOrder } from '../types/ordertypes';

interface ITGSecurity extends IDocument {
    tguserid: number;
    code: string;
    generationTime: Date;
}

interface ITGSecurityDataSchema extends IDocumentDataSchema {}
interface ITGSecurityWFSchema extends IDocumentWFSchema {}

export class TGSecurity extends Document<ITGSecurity, ITGSecurityDataSchema, ITGSecurityWFSchema> {
    get dataSchema(): ITGSecurityDataSchema {
        return {
            idFieldName: 'id',
            tableName: 'tgcodes',
            relatedTablesPrefix: 'tgcode_',
            fields: [
                { name: 'code', type: 'varchar(12)', required: true },
                { name: 'tguserid', type: 'int(20)', required: true },
                { name: 'generationTime', type: 'datetime', required: true },
            ],
            indexes: [{ fields: ['tguserid'], indexType: 'INDEX' }],
        };
    }

    get wfSchema(): ITGSecurityWFSchema {
        return {
            tableName: 'tgcodes',
            initialState: WorkflowStatusCode.registered,
        };
    }
}

/**
 *
 */
interface IUserDataSchema extends IDocumentDataSchema {}
interface IUserWFSchema extends IDocumentWFSchema {}

export class User extends Document<IUser, IUserDataSchema, IUserWFSchema> {
    get dataSchema(): IUserDataSchema {
        return {
            idFieldName: 'id',
            tableName: 'users',
            relatedTablesPrefix: 'user_',
            fields: [
                { name: `login`, type: 'varchar(128)', required: true },
                { name: `hash`, type: 'varchar(128)', required: true },
                { name: `name`, type: 'varchar(128)' },
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
        const hash = User.calcHash(this.data.login.toString(), secretKey === undefined ? '' : secretKey);
        return this.data.hash === hash;
    }

    get wfSchema(): IDocumentWFSchema {
        return {
            tableName: 'eatery',
            initialState: WorkflowStatusCode.done,
        };
    }
    async createEatery(eateryData: IEatery): Promise<Eatery> {
        eateryData.employees.push({
            userId: this.id,
            roles: [EateryRoleCode.owner],
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
            'select `eateries`.*, `linkedEateries`.`roles` from (SELECT `eatery_employees`.`eatery_id` as `id`, `roles` FROM `eatery_employees` WHERE `eatery_employees`.`blocked` = 0 and `eatery_employees`.`userId` = ?) as `linkedEateries` INNER join `eateries` on `linkedEateries`.`id` = `eateries`.`id`';
        mconsole.sqlq(sql, [this.id]);
        const [rows, fields] = await this.sqlConnection.query<IEateryBrief[]>(sql, [this.id]);
        const schema = new Eatery().dataSchema;
        rows.forEach(row => this.jsonTranslate(row, schema));
        mconsole.sqlinfo(rows, fields);
        return rows;
    }

    async mealsList(eateryId?: Types.ObjectId): Promise<IMealRow[]> {
        const sql = `select \`meals\`.* from \`meals\` where \`userId\` = ? ${eateryId !== undefined ? 'AND `eateryId` = ?' : ''}`;
        const params = [this.id];
        if (eateryId !== undefined) params.push(eateryId);
        mconsole.sqlq(sql, params);
        const [rows, fields] = await this.sqlConnection.query<IMealRow[]>(sql, [this.id]);
        const schema = new Meal().dataSchema;
        rows.forEach(row => this.jsonTranslate(row, schema));
        mconsole.sqlinfo(rows, fields);
        return rows;
    }

    async menusList(eateryId?: Types.ObjectId): Promise<IMenuRow[]> {
        const sql = `select \`menus\`.* from \`menus\` where \`userId\` = ? ${eateryId !== undefined ? 'AND `eateryId` = ?' : ''}`;
        const params = [this.id];
        if (eateryId !== undefined) params.push(eateryId);
        mconsole.sqlq(sql, params);
        const [rows, fields] = await this.sqlConnection.query<IMenuRow[]>(sql, [this.id]);
        const schema = new Menu().dataSchema;
        rows.forEach(row => this.jsonTranslate(row, schema));
        mconsole.sqlinfo(rows, fields);
        return rows;
    }

    async ordersList(eateryId?: Types.ObjectId, tableId?: Types.ObjectId, wfStatuses?: WorkflowStatusCode[]): Promise<IOrder[]> {
        const sql = `select \`orders\`.* from \`orders\` where \`userId\` = ? ${eateryId !== undefined ? 'AND `eateryId` = ? ' : ''} ${tableId !== undefined ? 'AND `tableId` = ? ' : ''} ${wfStatuses !== undefined && wfStatuses.length > 0 ? `AND ( ${wfStatuses.map(status => '`wfStatus` = ? ').join(' OR ')} )` : ''}`;
        const params: any[] = [this.id];
        if (eateryId !== undefined) params.push(eateryId);
        if (tableId !== undefined) params.push(tableId);
        if (wfStatuses !== undefined) params.push(...wfStatuses);
        mconsole.sqlq(sql, params);
        const [rows, fields] = await this.sqlConnection.query<IOrderRow[]>(sql, params);
        const ret: IOrder[] = [];
        for (const row of rows) {
            const o = new Order(row.id as Types.ObjectId);
            await o.load();
            ret.push(o.data);
        }
        return ret;
    }
}
