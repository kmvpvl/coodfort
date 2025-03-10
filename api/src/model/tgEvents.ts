import { Update, Message } from '@telegraf/types';
import { randomUUID } from 'crypto';
import { Context } from 'telegraf';
import { User, TGSecurity } from './user';

export async function startCommand(ctx: Context<Update.MessageUpdate<Message.TextMessage>>) {
    const tguserid = ctx.update.message.from.id;
    const login = `TG:${tguserid}`;
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
        if (empl.data.blocked) return ctx.reply(`Your account blocked. Send message to support`);
        return ctx.replyWithHTML(`Welcome back <strong>${empl.data.name}</strong>!`);
    } catch (e: any) {
        // new user
        const secretKey = randomUUID().toUpperCase();
        const hash = User.calcHash(login, secretKey);
        await empl.load({
            login: login,
            hash: hash,
            name: `${ctx.update.message.from.first_name} ${ctx.update.message.from.last_name}`,
        });
        await empl.save(login);
        return ctx.reply(`Welcome ${ctx.update.message.from.first_name}!\nYour account created. Your token is\n${login}:${secretKey}`);
    }
}

export async function renewToken(ctx: Context<Update.MessageUpdate<Message.TextMessage>>) {
    const tguserid = ctx.update.message.from.id;
    const login = `TG:${tguserid}`;
    const secretKey = randomUUID().toUpperCase();
    const hash = User.calcHash(login, secretKey);
    const empl = new User('login', login);

    try {
        await empl.load();
        if (empl.data.blocked) return ctx.reply(`Your account blocked. Send message to support`);
        empl.data.hash = hash;
        await empl.save(login);
        return ctx.reply(
            `Your token:\n${login}:${secretKey}`
            //{ reply_markup: { inline_keyboard: [[{ text: 'Order', web_app: { url: `${process.env.tgwebapp}/guest` } }]] } }
        );
    } catch (e: any) {
        // user not found
        return ctx.reply(`Your account not found. Use start command to register in`);
    }
}

export async function messageToSupport(ctx: Context<Update.MessageUpdate<Message.TextMessage>>) {
    const staff = process.env.support_staff?.split(',');
    if (staff !== undefined)
        for (const emplTgId of staff) {
            const user = new User('login', `TG:${emplTgId}`);
            try {
                await user.load();
                if (!user.data.blocked) ctx.telegram.sendMessage(emplTgId, `{"from": ${ctx.from.id}, "text":"${ctx.message.text}"}`);
            } catch (e) {}
        }
    return ctx.reply('Your message has been received. We are already working on it', { reply_parameters: { message_id: ctx.message.message_id } });
}
