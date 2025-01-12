import { ReactNode } from "react";
import "./pinger.css";
import Proto, { IProtoProps, IProtoState, ServerStatusCode } from "../proto";

export interface IPingerProps extends IProtoProps {
	pingFrequency?: number;
	onDisconnect?: () => void;
	onConnect?: () => void;
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
		const lStatus = this.state.serverStatus;
		this.serverFetch(
			"version",
			"GET",
			undefined,
			undefined,
			res => {
				//debugger
				if (!res.ok) return;
				if (this.props.onConnect !== undefined && lStatus !== ServerStatusCode.connected) this.props.onConnect();
				const nState = this.state;
				nState.serverVersion = res.version;
				this.setState(nState);
			},
			err => {
				if (this.props.onDisconnect !== undefined && lStatus !== ServerStatusCode.notAvailable) this.props.onDisconnect();
			}
		);
	}
	render(): ReactNode {
		return (
			<span className="pinger-container">
				{this.state.serverStatus !== undefined ? ServerStatusCode[this.state.serverStatus] : "unknown"} {process.env.SERVER_BASE_URL} {this.state.serverVersion}
			</span>
		);
	}
}
