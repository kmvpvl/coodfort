import { Context, Telegraf } from 'telegraf';
import { IDocument, WorkflowStatusCode } from '../types/prototypes';
import { Employee } from './eatery';
import { Document, IDocumentDataSchema, IDocumentWFSchema } from './protodocument';
import { CommonMessageBundle, InputTextMessageContent, Message, Update } from '@telegraf/types';
import { randomUUID } from 'crypto';

export interface AuthUser {
    guest?: object;
    employee?: Employee;
}

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

export async function startCommand(ctx: Context<Update.MessageUpdate<Message.TextMessage>>) {
    const tguserid = ctx.update.message.from.id;
    const login = `TG:${tguserid}`;
    const secretKey = randomUUID().toUpperCase();
    const hash = Employee.calcHash(login, secretKey);
    const msg_arr = ctx.update.message.text.split(' ');
    if (msg_arr.length === 2) {
        const code = msg_arr[1];
        const tgsec = new TGSecurity({
            code: code,
            tguserid: tguserid,
            generationTime: new Date(),
        });
        await tgsec.save(login);
    }
    const empl = new Employee('login', login);
    try {
        await empl.load();
        empl.data.hash = hash;
        await empl.save(login);
    } catch (e: any) {
        // new user
        await empl.load({
            login: login,
            hash: hash,
            name: `${ctx.update.message.from.first_name} ${ctx.update.message.from.last_name}`,
        });
        await empl.save(login);
    }

    return ctx.reply(`Your token: ${login}:${secretKey}`);
}
