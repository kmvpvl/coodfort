import React, { ReactNode } from "react";
import "./employeeApp.css";
import Proto, { IProtoProps, IProtoState, ServerStatusCode } from "./components/proto";

import Toaster from "./components/toast";
import Employee from "./components/employee/employee";
import Logo from "./components/logo/logo";

export interface IEmployeeAppProps extends IProtoProps {
	mode: string;
	pingFrequency?: number;
}

enum EmployeeAppExhibitViewCode {
	none,
	newEmployee,
	newEatery,
	enterToken,
}

export interface IEmployeeAppState extends IProtoState {
	exhibit: EmployeeAppExhibitViewCode;
	serverVersion?: string;
}

export default class EmployeeApp extends Proto<IEmployeeAppProps, IEmployeeAppState> {
	protected toasterRef = React.createRef<Toaster>();
	state: IEmployeeAppState = {
		exhibit: EmployeeAppExhibitViewCode.enterToken,
	};
	protected intervalPing?: NodeJS.Timeout;
	ping() {
		this.serverFetch("version", "GET", undefined, undefined, res => {
			if (!res.ok) return;
			const nState: IEmployeeAppState = this.state;
			nState.serverVersion = res.version;
			this.setState(nState);
		});
	}
	componentDidMount(): void {
		this.ping();
		if (this.intervalPing === undefined) this.intervalPing = setInterval(this.ping.bind(this), this.props.pingFrequency === undefined ? (process.env.MODE === "production" ? 30000 : 120000) : this.props.pingFrequency);
		this.login();
	}
	renderServerStatus(): ReactNode {
		return (
			<span className="employee-app-server-status">
				{this.state.serverStatus !== undefined ? ServerStatusCode[this.state.serverStatus] : "unknown"} {process.env.SERVER_BASE_URL} {this.state.serverVersion}
			</span>
		);
	}
	renderNoToken(): ReactNode {
		const emp: ReactNode = (
			<>
				{this.state.exhibit !== EmployeeAppExhibitViewCode.newEmployee ? (
					<span className="employee-app-choose-button">
						<span
							onClick={event => {
								const nState = this.state;
								nState.exhibit = EmployeeAppExhibitViewCode.newEmployee;
								this.setState(nState);
							}}>
							I'm a new Eployee
						</span>
						<span className="tip">{this.ML(`If you're have no account in CoodFort or you want create new account as an employee`)}</span>
					</span>
				) : (
					<span className="employee-app-enter-info">
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
				{this.state.exhibit !== EmployeeAppExhibitViewCode.newEatery ? (
					<span className="employee-app-choose-button">
						<span
							onClick={event => {
								const nState = this.state;
								nState.exhibit = EmployeeAppExhibitViewCode.newEatery;
								this.setState(nState);
							}}>
							I want to register new Eatery
						</span>
						<span className="tip">{this.ML(`If you're a manager or owner of the new Eatery and want to register one`)}</span>
					</span>
				) : (
					<span className="employee-app-enter-info">
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
				{this.state.exhibit !== EmployeeAppExhibitViewCode.enterToken ? (
					<span className="employee-app-choose-button">
						<span
							onClick={event => {
								const nState = this.state;
								nState.exhibit = EmployeeAppExhibitViewCode.enterToken;
								this.setState(nState);
							}}>
							I have token
						</span>
						<span className="tip">{this.ML(`You've registered earlier and had token. Insert token or recover your token here`)}</span>
					</span>
				) : (
					<span className="employee-app-enter-info">
						<h2>{this.ML(`Sign in`)}</h2>
						<span className="tip">{this.ML(`The result of your registration was token which we sent to your e-mail or/and Telegram. Check out you token or recover it by Telegram or e-mail`)}</span>
						<input
							type="password"
							placeholder={this.ML("Insert your token here")}
							onChange={event => {
								const token = event.currentTarget.value;
								if (token !== undefined) {
									this.login(token);
								}
							}}></input>
						<span className="tip">{this.ML(`To recover your token use Telegram`)}</span>
					</span>
				)}
			</>
		);

		return (
			<div className={this.state.exhibit === EmployeeAppExhibitViewCode.none ? "employee-app-container-notoken-none" : "employee-app-container-notoken-choosen"}>
				<Logo
					onClick={() => {
						const nState = this.state;
						nState.exhibit = EmployeeAppExhibitViewCode.none;
						this.setState(nState);
					}}
				/>
				{this.state.exhibit === EmployeeAppExhibitViewCode.none || this.state.exhibit === EmployeeAppExhibitViewCode.enterToken ? (
					<>
						{havet}
						{emp}
						{eat}
					</>
				) : this.state.exhibit === EmployeeAppExhibitViewCode.newEmployee ? (
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
		return this.state.user === undefined ? (
			this.renderNoToken()
		) : (
			<>
				<Employee employee={this.state.user} toaster={this.toasterRef} />
				{this.renderServerStatus()}
			</>
		);
	}
}
