import React, { ReactNode } from "react";
import "./WebApp.css";
import Proto, { IProtoProps, IProtoState, ServerStatusCode } from "./components/proto";

import { IEmployee } from "@betypes/eaterytypes";

import Toaster from "./components/toast";
import Employee from "./components/employee/employee";

export interface IWebAppProps extends IProtoProps {
	mode: string;
}

enum ExhibitViewCode {
	none,
	newEmployee,
	newEatery,
	enterToken,
}

export interface IWebAppState extends IProtoState {
	exhibit: ExhibitViewCode;
	serverVersion?: string;
}

declare global {
	interface Window {
		Telegram: any;
	}
}

export default class WebApp extends Proto<IWebAppProps, IWebAppState> {
	protected toasterRef = React.createRef<Toaster>();
	state: IWebAppState = {
		exhibit: ExhibitViewCode.enterToken,
	};
	protected intervalPing?: NodeJS.Timeout;
	ping() {
		this.serverFetch("version", "GET", undefined, undefined, res => {
			if (!res.ok) return;
			const nState: IWebAppState = this.state;
			nState.serverVersion = res.version;
			this.setState(nState);
		});
	}
	componentDidMount(): void {
		this.ping();
		this.intervalPing = setInterval(this.ping.bind(this), 30000);
		if (this.token !== undefined) this.login(this.token);
	}
	renderServerStatus(): ReactNode {
		return (
			<span className="webapp-server-status">
				{this.state.serverStatus !== undefined ? ServerStatusCode[this.state.serverStatus] : "unknown"} {process.env.REACT_APP_SERVER_BASE_URL} {this.state.serverVersion}
			</span>
		);
	}
	renderNoToken(): ReactNode {
		const emp: ReactNode = (
			<>
				{this.state.exhibit !== ExhibitViewCode.newEmployee ? (
					<span className="webapp-choose-button">
						<span
							onClick={event => {
								const nState = this.state;
								nState.exhibit = ExhibitViewCode.newEmployee;
								this.setState(nState);
							}}>
							I'm a new Eployee
						</span>
						<span className="tip">{this.ML(`If you're have no account in CoodFort or you want create new account as an employee`)}</span>
					</span>
				) : (
					<span className="webapp-enter-info">
						<h2>{this.ML(`New Employee`)}</h2>
						<div>
							<span>
								<input placeholder={this.ML("Enter your login")}></input>
								<span className="tip">{this.ML("Employer can see your login name, can find you by it and can invite you")}</span>
							</span>
							<span>
								<input placeholder={this.ML("Enter your password")}></input>
								<span className="tip">{this.ML("Nobody must see you password. Keep it secret")}</span>
							</span>
						</div>
						<div>
							<span>
								<input placeholder={this.ML("Enter your name (alias)")}></input>
								<span className="tip">{this.ML("All employer and guests can see your name")}</span>
							</span>
							<span>
								<input placeholder={this.ML("Enter your e-mail")}></input>
								<span className="tip">{this.ML("This e-mail allows you recover your account")}</span>
							</span>
						</div>
						<span className="tip">{this.ML("We strongly reccomend to you fill information to recover access to your Eatery. Use Telegram or e-mail to be sure that nobody can compromize your data")}</span>
					</span>
				)}
			</>
		);

		const eat: ReactNode = (
			<>
				{this.state.exhibit !== ExhibitViewCode.newEatery ? (
					<span className="webapp-choose-button">
						<span
							onClick={event => {
								const nState = this.state;
								nState.exhibit = ExhibitViewCode.newEatery;
								this.setState(nState);
							}}>
							I want to register new Eatery
						</span>
						<span className="tip">{this.ML(`If you're a manager or owner of the new Eatery and want to register one`)}</span>
					</span>
				) : (
					<span className="webapp-enter-info">
						<h2>{this.ML(`New Eatery`)}</h2>
						<span className="tip">{this.ML("To create new Eatery you have to fill master data of Eatery: Names, address, tables, its meals and drinks")}</span>
						<input placeholder={this.ML("Enter new Eatery name")}></input>
						<span className="tip">{this.ML("We strongly reccomend to you fill information to recover access to your Eatery. Use Telegram or e-mail to be sure that nobody can compromize your data")}</span>
					</span>
				)}
			</>
		);

		const havet: ReactNode = (
			<>
				{this.state.exhibit !== ExhibitViewCode.enterToken ? (
					<span className="webapp-choose-button">
						<span
							onClick={event => {
								const nState = this.state;
								nState.exhibit = ExhibitViewCode.enterToken;
								this.setState(nState);
							}}>
							I have token
						</span>
						<span className="tip">{this.ML(`You've registered earlier and had token. Insert token or recover your token here`)}</span>
					</span>
				) : (
					<span className="webapp-enter-info">
						<h2>{this.ML(`Sign in`)}</h2>
						<span className="tip">{this.ML(`The result of your registration was token which we sent to your e-mail or/and Telegram. Check out you token or recover it by Telegram or e-mail`)}</span>
						<input/>
						<span className="tip">{this.ML(`To recover your token use Telegram`)}</span>
					</span>
				)}
			</>
		);

		return (
			<div className={this.state.exhibit === ExhibitViewCode.none ? "webapp-container-notoken-none" : "webapp-container-notoken-choosen"}>
				<div
					onClick={event => {
						const nState = this.state;
						nState.exhibit = ExhibitViewCode.none;
						this.setState(nState);
					}}
					className="web-app-logo">
					<div className="web-app-logo-container">
						<img src="./logo_large.svg" />
					</div>
					<div>CoodFort</div>
				</div>
				{this.state.exhibit === ExhibitViewCode.none || this.state.exhibit === ExhibitViewCode.enterToken ? (
					<>
						{havet}
						{emp}
						{eat}
					</>
				) : this.state.exhibit === ExhibitViewCode.newEmployee ? (
					<>
						{emp}
						{havet}
						{eat}
					</>
				) : (
					<>
						{eat}
						{havet}
						{emp}
					</>
				)}
				{this.renderServerStatus()}
				<Toaster placesCount={3} ref={this.toasterRef} />
			</div>
		);
	}
	render(): ReactNode {
		//window.Telegram.WebApp.expand();

		return this.state.employee === undefined ? (
			this.renderNoToken()
		) : (
			<>
				<Employee employee={this.state.employee} toaster={this.toasterRef} />
				{this.renderServerStatus()}
			</>
		);
	}
}
