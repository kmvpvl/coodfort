import { ReactNode } from "react";
import "./pinger.css";
import Proto, { IProtoProps, IProtoState, ServerStatusCode } from "../proto";

export interface IPingerProps extends IProtoProps {
	pingFrequency?: number;
}
export interface IPingerState extends IProtoState {
	serverVersion?: string;
}

export default class Pinger extends Proto<IPingerProps, IPingerState> {
	state: IPingerState = {};
	protected intervalPing?: NodeJS.Timeout;
	componentDidMount(): void {
		this.ping();
		if (this.intervalPing === undefined) this.intervalPing = setInterval(this.ping.bind(this), this.props.pingFrequency === undefined ? (process.env.MODE === "production" ? 30000 : 120000) : this.props.pingFrequency);
	}
	ping() {
		this.serverFetch("version", "GET", undefined, undefined, res => {
			if (!res.ok) return;
			const nState = this.state;
			nState.serverVersion = res.version;
			this.setState(nState);
		});
	}
	render(): ReactNode {
		return (
			<span className="pinger-container">
				{this.state.serverStatus !== undefined ? ServerStatusCode[this.state.serverStatus] : "unknown"} {process.env.SERVER_BASE_URL} {this.state.serverVersion}
			</span>
		);
	}
}
