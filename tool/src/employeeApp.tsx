import React, { ReactNode } from "react";
import "./employeeApp.css";
import Proto, { IProtoProps, IProtoState, ServerStatusCode, ViewModeCode } from "./components/proto";

import Toaster from "./components/toast";
import Employee from "./components/employee/employee";
import Logo from "./components/logo/logo";
import Pinger from "./components/pinger/pinger";
import Dispatcher from "./components/employee/dispatcher";
import Pending from "./components/pending";

export interface IEmployeeAppProps extends IProtoProps {
	mode: string;
}

enum EmployeeAppExhibitViewCode {
	none,
	newEmployee,
	newEatery,
	enterToken,
}

export interface IEmployeeAppState extends IProtoState {
	exhibit: EmployeeAppExhibitViewCode;
}

export default class EmployeeApp extends Proto<IEmployeeAppProps, IEmployeeAppState> {
	protected toasterRef = React.createRef<Toaster>();
	state: IEmployeeAppState = {
		exhibit: EmployeeAppExhibitViewCode.enterToken,
	};
	componentDidMount(): void {
		document.title = "CoodFort eatery tool";
		this.login();
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
							{this.ML("I'm a new Employee")}
						</span>
						<span className="tip">{this.ML(`If you're have no account in CoodFort and you want create new account as an employee`)}</span>
					</span>
				) : (
					<span className="employee-app-enter-info">
						<h2>{this.ML(`New Employee`)}</h2>
						<div>
							<span>
								<span className="tip">
									{this.ML("To be able to restore access to your account in the future, we recommend obtaining an access token through a bot")}
									<div>
										<a href={process.env.TG_BOT_URL} target="_blank">
											{this.ML("Technical support bot")}
										</a>
									</div>
								</span>
							</span>
						</div>
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
							{this.ML("I want to register new Eatery")}
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
							{this.ML("I have token")}
						</span>
						<span className="tip">
							<div>{this.ML(`You've registered earlier and had token. Insert token or recover your token here`)}</div>
							<div>
								<a href={process.env.TG_BOT_URL} target="_blank">
									{this.ML("Technical support bot")}
								</a>
							</div>
						</span>
					</span>
				) : (
					<span className="employee-app-enter-info">
						<h2>{this.ML(`Log in`)}</h2>
						<span className="tip">{this.ML(`I already have an account and want to access from a new device`)}</span>
						<input
							type="password"
							placeholder={this.ML("Insert your token here")}
							onChange={event => {
								const token = event.currentTarget.value;
								if (token !== undefined) {
									this.login(token);
								}
							}}></input>
						<span className="tip">
							<div>{this.ML(`You can get your token on a device where you already have access, or restore it yourself via Telegram or contact support`)}</div>
							<div>
								<a href={`${process.env.TG_BOT_URL}?start=support`} target="_blank">
									{this.ML("Technical support bot")}
								</a>
							</div>
						</span>
					</span>
				)}
			</>
		);

		return (
			<div className={this.state.exhibit === EmployeeAppExhibitViewCode.none ? "employee-app-container-notoken-none" : "employee-app-container-notoken-choosen"}>
				<Logo
					viewMode={ViewModeCode.compact}
					className="employee-app-logo"
					onClick={() => {
						const nState = this.state;
						nState.exhibit = EmployeeAppExhibitViewCode.none;
						this.setState(nState);
					}}
				/>
				{this.state.exhibit === EmployeeAppExhibitViewCode.none || this.state.exhibit === EmployeeAppExhibitViewCode.enterToken ? (
					<>
						{havet}
						{
							//emp
						}
						{
							//eat
						}
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
				<Pinger />
				<Toaster placesCount={3} ref={this.toasterRef} />
			</div>
		);
	}
	render(): ReactNode {
		return this.state.user === undefined ? (
			this.renderNoToken()
		) : (
			<>
				<Dispatcher employee={this.state.user} toaster={this.toasterRef} />
				<Toaster ref={this.toasterRef} placesCount={3} />
				<Pinger />
			</>
		);
	}
}
