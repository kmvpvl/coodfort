import { ReactNode } from "react";
import "./WebApp.css";
import Proto, { IProtoProps, IProtoState, ServerStatusCode } from "./components/proto";

import { IMenuItem } from "@betypes/eaterytypes";

import MenuItem from "./components/menu/menuitem";

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
	loggedInToken?: string;
	exhibit: ExhibitViewCode;
	serverVersion?: string;
}

declare global {
	interface Window {
		Telegram: any;
	}
}

export default class WebApp extends Proto<IWebAppProps, IWebAppState> {
	state: IWebAppState = {
		exhibit: ExhibitViewCode.none,
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
						<input placeholder={this.ML("Insert your token here")}></input>
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
			</div>
		);
	}
	render(): ReactNode {
		//window.Telegram.WebApp.expand();
		const meal: IMenuItem = {
			name: "Americano",
			description: {
				default: "Coffee Americano (Brasilian arabica, middle roast)",
				values: [["ru", "Кофе Американо (Арабика из Бразилии, средняя обжарка)"]],
			},
			photos: [
				{
					caption: "",
					url: `data:image/jpeg;base64,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`,
				},
				{
					caption: "",
					url: `data:image/jpeg;base64,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`,
				},
			],
			options: [
				{
					volume: { default: "200 ml", values: [["ru", "200 мл"]] },
					amount: 150,
					currency: { default: "RUR", values: [["ru", "руб."]] },
					includeOptions: [
						{
							volume: "Coconut Syrup 10ml",
							amount: 50,
							currency: "RUR",
						},
					],
				},
				{
					volume: "300 ml",
					amount: 250,
					currency: "RUR",
					includeOptions: [
						{
							volume: "Coconut Syrup 10ml",
							amount: 50,
							currency: "RUR",
						},
					],
				},
			],
		};

		return this.state.loggedInToken !== undefined ? this.renderNoToken() : <MenuItem item={meal} admin={true} />;
	}
}
