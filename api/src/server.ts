import { configDotenv } from "dotenv";
import express, { Request, Response } from "express";
import { Eatery } from "./model/eateries";
import { mConsoleInit } from "./model/console";
import OpenAPIBackend from "openapi-backend";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import colours from "./model/colours";

configDotenv();
mConsoleInit();
const PORT = process.env.PORT || 8000;

const api = new OpenAPIBackend({
    definition: 'coodfort.yml'
});
api.init();
api.register({
    version: async (c, req, res, person) => {
        try {
            const pkg = require("../package.json");
            return res.status(200).json({ ok: true, version: pkg.version });
        } catch (e) {
            return res.status(400).json(e);
        }
    },
    tgconfig: async (c, req, res, person) => {
        return res.status(200).json({ ok: true });
    },
    //supportsendmessagetouser: async (c, req, res, user) => supportsendmessagetouser(c, req, res, user, bot),
    telegram: async (c, req, res, user) => res.status(200).json({ ok: true }),
    newEatery: async (c, req, res, user) => res.status(200).json({ ok: true }),
    updateEatery: async (c, req, res, user) => res.status(200).json({ ok: true }),

    validationFail: (c, req, res) => res.status(400).json({ ok: false, err: c.validation.errors }),
    notFound: (c, req, res) => {
        const p = path.join(__dirname, '..', 'public', req.path);
        if (fs.existsSync(p)) {
            return res.sendFile(p);
        }
        return res.status(404).json({ ok: false, err: `File '${req.path}' not found` });
    },
    notImplemented: (c, req, res) => res.status(500).json({ ok: false, err: `'${req.path}' not implemented` }),
    unauthorizedHandler: (c, req, res) => res.status(401).json({ ok: false, err: 'not auth' })
});

api.registerSecurityHandler('COODFortTGUserId', async (context, req, res) => {
    return true;
});
api.registerSecurityHandler('TGQueryCheckString', async (context, req, res) => {
    return true;
});
api.registerSecurityHandler('COODFortLogin', async (context, req, res) => {
    return true;
});
api.registerSecurityHandler('COODFortPassword', async (context, req, res) => {
    return true;
});


const app = express()
app.use(express.json())

// use as express middleware
app.use(async (req: Request, res: Response) => {
    const requestUUID = randomUUID();
    const requestStart = new Date();
    req.headers["coodfort-uuid"] = requestUUID;
    req.headers["coodfort-start"] = requestStart.toISOString();
    console.log(`🚀 ${requestStart.toISOString()} - [${requestUUID}] - ${req.method} ${colours.fg.yellow}${req.path}\n${colours.fg.blue}headers: ${Object.keys(req.headersDistinct).filter(v => v.startsWith("misiscoin-")).map(v => `${v} = '${req.headersDistinct[v]}'`).join(", ")}\nbody: ${Object.keys(req.body).map(v => `${v} = '${req.body[v]}'`).join(", ")}\nquery: ${Object.keys(req.query).map(v => `${v} = '${req.query[v]}'`).join(", ")}${colours.reset}`);

    const stguid = req.headers["coodfort-tguid"] as string;
    let ret;

    try {
        ret = await api.handleRequest({
            method: req.method,
            path: req.path,
            body: req.body,
            query: req.query as { [key: string]: string },
            headers: req.headers as { [key: string]: string }
        },
            req, res, undefined);
    } catch (e) {
        ret = res.status(500).json({ ok: false, err: e });
    }
    const requestEnd = new Date();
    req.headers["coodfort-request-end"] = requestEnd.toISOString();
    console.log(`🏁 ${requestStart.toISOString()} - [${requestUUID}] - ${req.method} ${res.statusCode >= 200 && res.statusCode < 400 ? colours.fg.green : colours.fg.red}${req.path}${colours.reset} - ${res.statusCode} - ${requestEnd.getTime() - requestStart.getTime()} ms`);
    return ret;
});

// Start the server at port
export const server = app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
