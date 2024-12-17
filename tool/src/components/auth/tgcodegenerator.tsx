import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ProtoErrorCode } from "../proto";
import "./tgcodegenerator.css";
import crypto from "crypto";

export interface ITGCodeGeneratorProps extends IProtoProps {}

export interface ITGCodeGeneratorState extends IProtoState {
	generationTime?: Date;
	uniqString?: string;
	spentTime?: number;
}

export default class TGCodeGenerator extends Proto<ITGCodeGeneratorProps, ITGCodeGeneratorState> {
	checkAuthorizationOnServerHandler?: NodeJS.Timeout;
	state: ITGCodeGeneratorState = {};
	createNewUniq() {
		const uniq1 = `00${Math.round(Math.random() * 1000).toString()}`.slice(-3);
		const nState: ITGCodeGeneratorState = this.state;
		nState.uniqString = uniq1 + `00${Math.round(Math.random() * 1000).toString()}`.slice(-3);
		nState.generationTime = new Date();
		if (this.checkAuthorizationOnServerHandler !== undefined) {
			clearInterval(this.checkAuthorizationOnServerHandler);
		}
		this.setState(nState);
	}

	checkAuthorizationOnServer() {
		this.serverFetch(
			"tgcheckuserauthorization",
			"POST",
			undefined,
			JSON.stringify({ code: this.state.uniqString, gentime: this.state.generationTime }),
			res => {
				console.log(res);
			},
			err => {
				console.log(err);
				if (err.json.code !== ProtoErrorCode.serverNotAvailable && this.state.generationTime !== undefined) {
					const nState = this.state;
					nState.spentTime = (new Date().getTime() - this.state.generationTime.getTime()) / 1000;
					if (nState.spentTime > 120) {
						nState.generationTime = undefined;
						nState.uniqString = undefined;
						nState.spentTime = undefined;
						clearInterval(this.checkAuthorizationOnServerHandler);
					}
					this.setState(nState);
				}
			}
		);
	}
	render(): ReactNode {
		return (
			<div className="">
				{this.state.uniqString !== undefined && this.state.generationTime !== undefined ? (
					<span>{this.state.spentTime}</span>
				) : (
					<span
						onClick={event => {
							this.createNewUniq();
							window.open(`https://t.me/coodfortbot?start=${this.state.uniqString}`, "_blank");
							this.checkAuthorizationOnServerHandler = setInterval(this.checkAuthorizationOnServer.bind(this), 5000);
						}}>
						Auth
					</span>
				)}
			</div>
		);
	}
}
