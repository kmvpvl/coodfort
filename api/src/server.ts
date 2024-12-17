import { configDotenv } from 'dotenv';
import express, { Request, Response } from 'express';
import { Employee } from './model/eatery';
import { mconsole, mConsoleInit } from './model/console';
import OpenAPIBackend, { Context } from 'openapi-backend';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import colours from './model/colours';
import { DocumentError } from './model/protodocument';
import { AuthUser, startCommand } from './model/security';
import { newEmployee, viewEmployee } from './api/employee';
import { updateEatery, newEatery, viewEatery, publishEatery } from './api/eatery';
import { newMeal } from './api/meal';
import cors from 'cors';
import { Telegraf } from 'telegraf';

configDotenv();
const TGTOKEN = process.env.tgtoken;
const TGWEBHOOK = process.env.tgwebhook;
if (TGTOKEN === undefined) throw new Error('TGTOKEN undefined');
if (TGWEBHOOK === undefined) throw new Error('TGWEBHOOK undefined');

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
    tgBot.launch({
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
    newEatery: newEatery,
    updateEatery: updateEatery,
    viewEatery: viewEatery,
    publishEatery: publishEatery,
    newEmployee: newEmployee,
    viewEmployee: viewEmployee,
    newMeal: newMeal,

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

api.registerSecurityHandler('COODFortTGUserId', (c: Context, req: Request, res: Response, user: AuthUser) => {
    const tguid = req.headers['coodfort-tguid'];
    mconsole.auth(`COODFortTGUserId security check. coodfort-tguid = ${tguid === undefined ? '-' : tguid}`);
    return tguid !== undefined;
});
api.registerSecurityHandler('TGQueryCheckString', (c: Context, req: Request, res: Response, user: AuthUser) => {
    const check = req.headers['coodfort-tgquerycheckstring'];
    mconsole.auth(`TGQueryCheckString security check. coodfort-tgquerycheckstring = ${check !== undefined ? check : '-'}`);
    return check !== undefined;
});
api.registerSecurityHandler('COODFortLogin', (c: Context, req: Request, res: Response, user: AuthUser) => {
    const login = req.headers['coodfort-login'];
    mconsole.auth(`COODFortLogin security check. coodfort-login = ${login === undefined ? '-' : login}`);
    return login !== undefined;
});
api.registerSecurityHandler('COODFortPassword', (c: Context, req: Request, res: Response, user: AuthUser) => {
    const password = req.headers['coodfort-password'] as string;
    mconsole.auth(`COODFortPassword security check. coodfort-password = ${password === undefined ? '-' : password}`);
    return user.employee?.checkSecretKey(password);
});

export const app = express();
app.use(express.json());
app.use(cors());

// use as express middleware
app.use(async (req: Request, res: Response) => {
    const requestUUID = randomUUID();
    const requestStart = new Date();
    console.log(
        `🚀 ${requestStart.toISOString()} - [${requestUUID}] - ${req.method} ${colours.fg.yellow}${req.path}\n${colours.fg.blue}headers: ${Object.keys(req.headersDistinct)
            .filter(v => v.startsWith('misiscoin-'))
            .map(v => `${v} = '${req.headersDistinct[v]}'`)
            .join(', ')}\nbody: ${Object.keys(req.body)
            .map(v => `${v} = '${req.body[v]}'`)
            .join(', ')}\nquery: ${Object.keys(req.query)
            .map(v => `${v} = '${req.query[v]}'`)
            .join(', ')}${colours.reset}`
    );

    let ret;
    const tguid = req.headers['coodfort-tguid'];
    const login = req.headers['coodfort-login'];

    const user: AuthUser = {};
    if (login !== undefined) {
        try {
            user.employee = new Employee('login', login);
            await user.employee.load();
            if (user.employee.data.blocked)
                return res.status(403).json({
                    ok: false,
                    error: { message: `User was blocked` },
                });
        } catch (e: any) {
            if (e instanceof DocumentError) user.employee = undefined;
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
    } catch (e) {
        ret = res.status(500).json({ ok: false, error: e });
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
