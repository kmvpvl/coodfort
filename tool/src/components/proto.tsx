import React from "react";
import { Types } from "@betypes/prototypes";
import MLString, { mlStrings } from "../model/mlstring";
import Toaster from "./toast";

export enum ProtoErrorCode {
	serverNotAvailable,
	httpError,
}
export class ProtoError extends Error {
	protected _code: ProtoErrorCode;
	constructor(code: ProtoErrorCode, message: string) {
		super(message);
		this._code = code;
	}
	get json() {
		return { code: this._code, message: this.message };
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
}

export interface IProtoState {
	serverStatus?: ServerStatusCode;
}
export default class Proto<IProps extends IProtoProps, IState extends IProtoState> extends React.Component<IProps, IState> {
	protected getLanguage(): string {
		if (this.props.lang !== undefined) return this.props.lang;
		const params: string[] = window.location.search.substring(1).split("&");
		let lang = window.navigator.language.split("-")[0];
		const lang_param = params.filter(v => v.split("=")[0] === "lang");
		if (lang_param !== undefined && lang_param.length > 0) lang = lang_param[0].split("=")[1];
		return lang;
	}

	protected toString(mlString?: Types.IMLString, lang?: string): string | undefined {
		if (mlString === undefined) return;
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

		const h: Headers = new Headers([
			["Access-Control-Allow-Origin", "*"],
			["ngrok-skip-browser-warning", "any"],
			["Content-Type", "application/json; charset=utf-8"],
		]);
		if (headers) {
			const oheaders = new Headers(headers);
			for (const [h1, h2] of oheaders.entries()) {
				h.append(h1, h2);
			}
		}
		fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/${command}`, {
			method: method,
			headers: h,
			body: body,
		})
			.then(res => {
				if (!res.ok) return Promise.reject(res);
				return res.json();
			})
			.then(v => {
				const nStatus: IState = this.state;
				nStatus.serverStatus = ServerStatusCode.connected;
				this.setState(nStatus);

				if (successcb) successcb(v);
			})
			.catch(v => {
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
							const err = new ProtoError(ProtoErrorCode.httpError, `url='${v.url}'; status='${v.status}'; text='${v.statusText}'; server_desc='${JSON.stringify(j)}'`);
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

	/*protected serverCommand (command: string, si: IServerInfo, body?: BodyInit, successcb?: (res: any)=>void, failcb?: (err: PlutchikError)=>void){
        serverFetch(command, 'POST', {
            "plutchik-tguid": si.tguserid?si.tguserid.toString():'',
            "plutchik-sessiontoken": si.sessiontoken?si.sessiontoken:''
        }, body, successcb, failcb);
    }*/
}
