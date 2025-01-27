import { configDotenv } from 'dotenv';
import express, { Request, Response } from 'express';
import { mconsole, mConsoleInit } from './model/console';
import OpenAPIBackend, { Context } from 'openapi-backend';
import path from 'path';
import fs from 'fs';
import { createHmac, randomUUID } from 'crypto';
import colours from './model/colours';
import { DocumentError } from './model/protodocument';
import { startCommand } from './model/tgEvents';
import { userEateriesList, userMealsList, userMenusList, newUser, viewUser, userOrdersList } from './api/user';
import { updateEatery, newEatery, viewEatery, publishEatery, tableCallWaiterSignalsList, callWaiter } from './api/eatery';
import { updateMeal, updateMenu, viewMeal, viewMenu } from './api/meal';
import cors from 'cors';
import { Telegraf } from 'telegraf';
import { User } from './model/user';
import { eateryOrderList, updateOrder, viewOrder, wfNextOrderItem } from './api/order';

configDotenv();
const TGTOKEN = process.env.tgtoken;
const TGWEBHOOK = process.env.tgwebhook;
const TGWEBAPP = process.env.tgwebapp;
if (TGTOKEN === undefined) throw new Error('TGTOKEN undefined');
if (TGWEBHOOK === undefined) throw new Error('TGWEBHOOK undefined');
if (TGWEBAPP === undefined) throw new Error('TGWEBAPP undefined');

let tgBot: Telegraf;
try {
    tgBot = new Telegraf(TGTOKEN);
    process.once('SIGINT', () => tgBot.stop('SIGINT'));
    process.once('SIGTERM', () => tgBot.stop('SIGTERM'));

    tgBot.command('start', startCommand);
    tgBot.catch(async (err, ctx) => {
        console.log(err, ctx);
    });

    // Start webhook via launch method (preferred)
    setTimeout(async () => {
        try {
            await tgBot.launch({
                webhook: {
                    // Public domain for webhook; e.g.: example.com
                    domain: TGWEBHOOK,

                    // Port to listen on; e.g.: 8080
                    //port: "80",

                    // Optional path to listen for.
                    // `bot.secretPathComponent()` will be used by default
                    //path: webhookPath,

                    // Optional secret to be sent back in a header for security.
                    // e.g.: `crypto.randomBytes(64).toString("hex")`
                    //secretToken: randomAlphaNumericString,
                },
            });
        } catch (e) {
            console.log('TG bot not started', e);
        }
    }, 500);
} catch (e) {
    console.log('TG bot not started', e);
}

mConsoleInit();

const PORT = process.env.PORT || 8000;

const api = new OpenAPIBackend({
    definition: 'coodfort.yml',
});
api.init();
api.register({
    version: async (c, req, res) => {
        try {
            const pkg = require('../package.json');
            return res.status(200).json({ ok: true, version: pkg.version });
        } catch (e) {
            return res.status(400).json(e);
        }
    },
    updateEatery: updateEatery,
    viewEatery: viewEatery,
    publishEatery: publishEatery,
    newUser: newUser,
    viewUser: viewUser,
    newMeal: updateMeal,
    updateMeal: updateMeal,
    viewMeal: viewMeal,
    updateMenu: updateMenu,
    viewMenu: viewMenu,
    userEateriesList: userEateriesList,
    userMealsList: userMealsList,
    userMenusList: userMenusList,
    userOrdersList: userOrdersList,
    updateOrder: updateOrder,
    viewOrder: viewOrder,
    wfNextOrderItem: wfNextOrderItem,
    eateryOrderList: eateryOrderList,
    tableCallWaiterSignalsList: tableCallWaiterSignalsList,
    callWaiter: callWaiter,

    validationFail: (c: Context, req: Request, res: Response) => res.status(400).json({ ok: false, err: c.validation.errors }),
    notFound: (c: Context, req: Request, res: Response) => {
        if (req.path.indexOf('/telegraf') === 0) {
            tgBot.handleUpdate(req.body);
            return res.status(200).json('ok');
        }
        const p = path.join(__dirname, '..', 'public', req.path);
        if (fs.existsSync(p)) {
            return res.sendFile(p);
        }
        return res.status(404).json({ ok: false, err: `File '${req.path}' not found` });
    },
    notImplemented: (c: Context, req: Request, res: Response) => res.status(500).json({ ok: false, err: `'${req.path}' not implemented` }),
    unauthorizedHandler: (c: Context, req: Request, res: Response) => res.status(401).json({ ok: false, err: 'not auth' }),
});

api.registerSecurityHandler('COODFortTGUserId', (c: Context, req: Request, res: Response, user: User) => {
    const tguid = req.headers['coodfort-tguid'];
    mconsole.auth(`COODFortTGUserId security check. coodfort-tguid = ${tguid === undefined ? '-' : tguid}`);
    return tguid !== undefined;
});
api.registerSecurityHandler('TGQueryCheckString', (c: Context, req: Request, res: Response, user: User) => {
    try {
        const tgquerycheckstring = decodeURIComponent(req.headers['coodfort-tgquerycheckstring'] as string);
        const arr = tgquerycheckstring.split('&');
        const hashIndex = arr.findIndex(str => str.startsWith('hash='));
        const hash = arr.splice(hashIndex)[0].split('=')[1];

        const secret_key = createHmac('sha256', 'WebAppData')
            .update(process.env.TGTOKEN as string)
            .digest();
        arr.sort((a, b) => a.localeCompare(b));

        const check_hash = createHmac('sha256', secret_key).update(arr.join('\n')).digest('hex');
        return check_hash === hash;
    } catch (e) {
        return false;
    }
});
api.registerSecurityHandler('COODFortLogin', (c: Context, req: Request, res: Response, user: User) => {
    const login = req.headers['coodfort-login'];
    mconsole.auth(`COODFortLogin security check. coodfort-login = ${login === undefined ? '-' : login}`);
    return login !== undefined;
});
api.registerSecurityHandler('COODFortPassword', (c: Context, req: Request, res: Response, user: User) => {
    const password = req.headers['coodfort-password'] as string;
    mconsole.auth(`COODFortPassword security check. coodfort-password = ${password === undefined ? '-' : '*******'}`);
    return user.checkSecretKey(password);
});

export const app = express();
app.use(express.json({ limit: '3mb' }));
app.use(cors());

// use as express middleware
app.use(async (req: Request, res: Response) => {
    const requestUUID = randomUUID();
    const requestStart = new Date();
    console.log(
        `🚀 ${requestStart.toISOString()} - [${requestUUID}] - ${req.method} ${colours.fg.yellow}${req.path}${Object.keys(req.headersDistinct).filter(v => v.startsWith('coodfort-')).length > 0 ? `\n${colours.fg.blue}headers: ` : ''}${Object.keys(
            req.headersDistinct
        )
            .filter(v => v.startsWith('coodfort-') && v !== 'coodfort-password')
            .map(v => `${v} = '${req.headersDistinct[v]}'`)
            .join(', ')}${Object.keys(req.body).length > 0 ? '\nbody: ' : ''}${Object.keys(req.body)
            .map(v => `${v} = '${req.body[v]}'`)
            .join(', ')}${Object.keys(req.query).length > 0 ? '\nquery: ' : ''}${Object.keys(req.query)
            .map(v => `${v} = '${req.query[v]}'`)
            .join(', ')}${colours.reset}`
    );

    let ret;
    const tguid = req.headers['coodfort-tguid'];
    const login = req.headers['coodfort-login'];

    let user: User | undefined;
    if (login !== undefined) {
        try {
            user = new User('login', login);
            await user.load();
            if (user.data.blocked)
                return res.status(403).json({
                    ok: false,
                    error: { message: `User was blocked` },
                });
        } catch (e: any) {
            if (e instanceof DocumentError) user = undefined;
        }
    }
    if (tguid !== undefined) {
        try {
            user = new User('login', `TG:${tguid}`);
            await user.load();
            if (user.data.blocked)
                return res.status(403).json({
                    ok: false,
                    error: { message: `User was blocked` },
                });
        } catch (e: any) {
            if (e instanceof DocumentError) user = undefined;
        }
    }

    try {
        ret = await api.handleRequest(
            {
                method: req.method,
                path: req.path,
                body: req.body,
                query: req.query as { [key: string]: string },
                headers: req.headers as { [key: string]: string },
            },
            req,
            res,
            user
        );
    } catch (e: any) {
        ret = res.status(500).json({ ok: false, error: { message: e.message } });
    }
    const requestEnd = new Date();
    console.log(
        `🏁 ${requestStart.toISOString()} - [${requestUUID}] - ${req.method} ${res.statusCode >= 200 && res.statusCode < 400 ? colours.fg.green : colours.fg.red}${req.path}${colours.reset} - ${res.statusCode} - ${requestEnd.getTime() - requestStart.getTime()} ms`
    );
    return ret;
});

// Start the server at port
export const server = app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});
