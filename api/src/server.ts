import { configDotenv } from "dotenv";
import express, { Request, Response } from "express";
import { Eatery } from "./model/eateries";
import { mconsole, mConsoleInit } from "./model/console";
import OpenAPIBackend, {Context} from "openapi-backend";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import colours from "./model/colours";
import { WorkflowError } from "./model/sqlproto";
import { AuthUser } from "./model/security";
import { newEmployee } from "./api/employee";

configDotenv();
mConsoleInit();

const PORT = process.env.PORT || 8000;

const api = new OpenAPIBackend({
    definition: 'coodfort.yml'
});
api.init();
api.register({
    version: async (c, req, res) => {
        try {
            const pkg = require("../package.json");
            return res.status(200).json({ ok: true, version: pkg.version });
        } catch (e) {
            return res.status(400).json(e);
        }
    },
    tgconfig: async (c: Context, req: Request, res: Response) => {
        return res.status(200).json({ ok: true });
    },
    telegram: async (c: Context, req: Request, res: Response, user: AuthUser) => res.status(200).json({ ok: true }),
    newEatery: async (c: Context, req: Request, res: Response, user: AuthUser) => res.status(200).json({ ok: true, guest: user.guest }),
    updateEatery: async (c: Context, req: Request, res: Response, user: AuthUser) => res.status(200).json({ ok: true, guest: user.guest  }),
    newEmployee: newEmployee,

    validationFail: (c: Context, req: Request, res: Response) => res.status(400).json({ ok: false, err: c.validation.errors }),
    notFound: (c: Context, req: Request, res: Response) => {
        const p = path.join(__dirname, '..', 'public', req.path);
        if (fs.existsSync(p)) {
            return res.sendFile(p);
        }
        return res.status(404).json({ ok: false, err: `File '${req.path}' not found` });
    },
    notImplemented: (c: Context, req: Request, res: Response) => res.status(500).json({ ok: false, err: `'${req.path}' not implemented` }),
    unauthorizedHandler: (c: Context, req: Request, res: Response) => res.status(401).json({ ok: false, err: 'not auth' })
});

api.registerSecurityHandler('COODFortTGUserId', (c: Context, req: Request, res: Response, user: AuthUser) => {
    const tguid = req.headers["coodfort-tguid"];
    mconsole.auth(`COODFortTGUserId security check. coodfort-tguid = ${tguid === undefined?"-":tguid}`);
    return tguid !== undefined;
});
api.registerSecurityHandler('TGQueryCheckString', (c: Context, req: Request, res: Response, user: AuthUser) => {
    const check = req.headers["coodfort-tgquerycheckstring"];
    mconsole.auth(`TGQueryCheckString security check. coodfort-tgquerycheckstring = ${check !== undefined?check:"-"}`);
    return check !== undefined;
});
api.registerSecurityHandler('COODFortLogin', (c: Context, req: Request, res: Response, user: AuthUser) => {
    const login = req.headers["coodfort-login"];
    mconsole.auth(`COODFortLogin security check. coodfort-login = ${login === undefined?"-":login}`);
    return login !== undefined;
});
api.registerSecurityHandler('COODFortPassword', (c: Context, req: Request, res: Response, user: AuthUser) => {
    const password = req.headers["coodfort-password"];
    mconsole.auth(`COODFortPassword security check. coodfort-password = ${password === undefined?"-":password}`);
    return password !== undefined;
});


export const app = express()
app.use(express.json())

// use as express middleware
app.use(async (req: Request, res: Response) => {
    const requestUUID = randomUUID();
    const requestStart = new Date();
    console.log(`🚀 ${requestStart.toISOString()} - [${requestUUID}] - ${req.method} ${colours.fg.yellow}${req.path}\n${colours.fg.blue}headers: ${Object.keys(req.headersDistinct).filter(v => v.startsWith("misiscoin-")).map(v => `${v} = '${req.headersDistinct[v]}'`).join(", ")}\nbody: ${Object.keys(req.body).map(v => `${v} = '${req.body[v]}'`).join(", ")}\nquery: ${Object.keys(req.query).map(v => `${v} = '${req.query[v]}'`).join(", ")}${colours.reset}`);

    let ret;
    const tguid = req.headers["coodfort-tguid"];
    const login = req.headers["coodfort-login"];

    const user: AuthUser = {
    }
    
    try {
        ret = await api.handleRequest({
            method: req.method,
            path: req.path,
            body: req.body,
            query: req.query as { [key: string]: string },
            headers: req.headers as { [key: string]: string },
        },
            req, res, user);
    } catch (e) {
        ret = res.status(500).json({ ok: false, err: e });
    }
    const requestEnd = new Date();
    console.log(`🏁 ${requestStart.toISOString()} - [${requestUUID}] - ${req.method} ${res.statusCode >= 200 && res.statusCode < 400 ? colours.fg.green : colours.fg.red}${req.path}${colours.reset} - ${res.statusCode} - ${requestEnd.getTime() - requestStart.getTime()} ms`);
    return ret;
});

// Start the server at port
export const server = app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
