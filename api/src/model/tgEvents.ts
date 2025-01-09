import { Update, Message } from '@telegraf/types';
import { randomUUID } from 'crypto';
import { Context } from 'telegraf';
import { User, TGSecurity } from './user';

export async function startCommand(ctx: Context<Update.MessageUpdate<Message.TextMessage>>) {
    const tguserid = ctx.update.message.from.id;
    const login = `TG:${tguserid}`;
    const secretKey = randomUUID().toUpperCase();
    const hash = User.calcHash(login, secretKey);
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
    const empl = new User('login', login);
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

    return ctx.reply(`Your token: ${login}:${secretKey}`, { reply_markup: { inline_keyboard: [[{ text: 'Order', web_app: { url: `${process.env.tgwebapp}/guest` } }]] } });
}
