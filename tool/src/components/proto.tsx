import React from "react";
import { Types, IUser, IDocumentError } from "@betypes/prototypes";
import MLString, { mlStrings } from "../model/mlstring";
import Toaster from "./toast";
import Pending from "./pending";

export enum ProtoErrorCode {
	serverNotAvailable,
	httpError,
	authDataExpected,
}
class ProtoError extends Error {
	protected _code: ProtoErrorCode;
	protected _httpCode?: number;
	protected _serverError?: IDocumentError;
	constructor(code: ProtoErrorCode, message: string, httpCode?: number, serverError?: IDocumentError) {
		super(message);
		this._code = code;
		this._httpCode = httpCode;
		this._serverError = serverError;
	}
	get json() {
		return {
			code: this._code,
			message: this.message,
			httpCode: this._httpCode,
			serverError: this._serverError,
		};
	}
}
export enum ServerStatusCode {
	connecting,
	notAvailable,
	connected,
}

export interface IProtoProps {
	lang?: string;
	toaster?: React.RefObject<Toaster | null>;
	onSingIn?: (user: IUser) => void;
	onSignOut?: () => void;
	onSignError?: (err: ProtoError) => void;
}

export interface IProtoState {
	serverStatus?: ServerStatusCode;
	signedIn?: boolean;
	user?: IUser;
}
export default class Proto<IProps extends IProtoProps, IState extends IProtoState> extends React.Component<IProps, IState> {
	protected pendingRef: React.RefObject<Pending | null> = React.createRef();

	private get token(): string | undefined {
		const ls = localStorage.getItem("coodforttoken");
		return ls ? (ls as string) : undefined;
	}

	private getTokenPair(token?: string | null): [string | undefined, string | undefined] {
		if ((token === undefined || token === null) && this.token !== undefined) token = this.token;
		if (token) {
			const token_parts = token.split(":");
			const password = token_parts.pop();
			if (password !== undefined) {
				const login = token_parts.join(":");
				return [login, password];
			}
		}
		return [undefined, undefined];
	}

	login(token?: string, sucesscb?: (res: any) => void, failcb?: (err: ProtoError) => void) {
		if (token !== undefined) localStorage.setItem("coodforttoken", token);
		this.serverCommand(
			"user/view",
			undefined,
			res => {
				console.log(res);
				if (res.ok) {
					const nState: IState = this.state;
					nState.user = res.user;
					nState.signedIn = true;
					this.setState(nState);
					if (this.props.onSingIn !== undefined) this.props.onSingIn(res.user);
				}
				if (sucesscb !== undefined) sucesscb(res);
			},
			err => {
				console.log(err.json);
				if (this.props.onSignError !== undefined) this.props.onSignError(err);
				if (failcb !== undefined) failcb(err);
			}
		);
	}

	protected getLanguage(): string {
		if (this.props.lang !== undefined) return this.props.lang;
		const params: string[] = window.location.search.substring(1).split("&");
		let lang = window.navigator.language.split("-")[0];
		const lang_param = params.filter(v => v.split("=")[0] === "lang");
		if (lang_param !== undefined && lang_param.length > 0) lang = lang_param[0].split("=")[1];
		return lang;
	}

	protected toString(mlString?: Types.IMLString, lang?: string): string {
		if (mlString === undefined) return "";
		const mls = new MLString(mlString);
		return mls.toString(lang === undefined ? this.getLanguage() : lang);
	}

	protected ML(str?: string, lang?: string): string {
		if (lang === undefined) {
			lang = this.getLanguage();
		}
		if (str === undefined) return `Unknown string`;
		if (lang === undefined) return str;
		if (!mlStrings.has(str)) {
			console.log(`String '${str}' is absent`);
			return str;
		}
		const el = mlStrings.get(str);
		if (!el?.has(lang)) return str;
		return el.get(lang) as string;
	}

	protected serverFetch(command: string, method: string, headers?: HeadersInit, body?: BodyInit, successcb?: (res: any) => void, failcb?: (err: ProtoError) => void) {
		const nStatus: IState = this.state;
		nStatus.serverStatus = ServerStatusCode.connecting;
		this.setState(nStatus);

		const h: Headers = new Headers([["Content-Type", "application/json; charset=utf-8"]]);
		if (headers) {
			const oheaders = new Headers(headers);
			for (const [h1, h2] of oheaders.entries()) {
				h.append(h1, h2);
			}
		}
		this.pendingRef.current?.incDeepCount();
		fetch(`${process.env.SERVER_BASE_URL}/${command}`, {
			method: method,
			headers: h,
			body: body,
		})
			.then(res => {
				if (!res.ok) return Promise.reject(res);
				return res.json();
			})
			.then(v => {
				this.pendingRef.current?.decDeepCount();
				const nStatus: IState = this.state;
				nStatus.serverStatus = ServerStatusCode.connected;
				this.setState(nStatus);

				if (successcb) successcb(v);
			})
			.catch(v => {
				this.pendingRef.current?.decDeepCount();
				if (v instanceof Error) {
					const nStatus: IState = this.state;
					nStatus.serverStatus = ServerStatusCode.notAvailable;
					this.setState(nStatus);
					if (failcb) {
						failcb(new ProtoError(ProtoErrorCode.serverNotAvailable, v.message));
					}
				} else {
					v.json()
						.then((j: any) => {
							const err = new ProtoError(ProtoErrorCode.httpError, v.statusText, v.status, j);
							const nStatus: IState = this.state;
							nStatus.serverStatus = ServerStatusCode.connected;
							this.setState(nStatus);
							if (failcb) failcb(err);
						})
						.catch((err: any) => {
							debugger;
						});
				}
			});
	}

	protected serverCommand(command: string, body?: BodyInit, successcb?: (res: any) => void, failcb?: (err: ProtoError) => void) {
		const [login, password] = this.getTokenPair(this.token);
		const headers: Headers = new Headers();

		if (window.Telegram !== undefined && "user" in window.Telegram?.WebApp.initDataUnsafe) {
			headers.append("coodfort-tguid", window.Telegram.WebApp.initDataUnsafe.user.id.toString());
			headers.append("coodfort-tgquerycheckstring", window.Telegram.WebApp.initData);
		} else {
			if (password === undefined && login === undefined) {
				if (failcb !== undefined) failcb(new ProtoError(ProtoErrorCode.authDataExpected, "Both login and password are undefined. Call to server didn't take place"));
				return;
			} else {
				headers.append("coodfort-login", login !== undefined ? login : "");
				headers.append("coodfort-password", password !== undefined ? password : "");
			}
		}

		this.serverFetch(command, "POST", headers, body, successcb, failcb);
	}
	protected isHTML(str: string): boolean {
		const doc = new DOMParser().parseFromString(str, "text/html");
		const ret = Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
		return ret;
	}
}
