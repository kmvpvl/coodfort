import React, { ReactNode } from "react";
import "./WebApp.css";
import Proto, { IProtoProps, IProtoState } from "./components/proto";

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
						<span className="tip">
							{this.ML(
								`If you're have no account in CoodFort or you want create new account as an employee`
							)}
						</span>
					</span>
				) : (
					<span className="webapp-enter-info">Enter your name</span>
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
						<span className="tip">
							{this.ML(
								`If you're a manager or owner of the new Eatery and want to register one`
							)}
						</span>
					</span>
				) : (
					<span className="webapp-enter-info">
						Enter new Eatery name
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
						<span className="tip">
							{this.ML(
								`You've registered earlier and had token. Insert token or recover your token here`
							)}
						</span>
					</span>
				) : (
					<span className="webapp-enter-info">
						<span className="tip">
							{this.ML(
								`The result of your registration was token which we sent to your e-mail or/and Telegram. Check out you token or recover it by Telegram or e-mail`
							)}
						</span>
						<input
							placeholder={this.ML(
								"Insert your token here"
							)}></input>
						<span className="tip">
							{this.ML(`To recover your token use Telegram`)}
						</span>
					</span>
				)}
			</>
		);

		return (
			<div
				className={
					this.state.exhibit === ExhibitViewCode.none
						? "webapp-container-notoken-none"
						: "webapp-container-notoken-choosen"
				}>
				<div
					onClick={event => {
						const nState = this.state;
						nState.exhibit = ExhibitViewCode.none;
						this.setState(nState);
					}}
					className="web-app-logo">
					<div>
						<img src="./logo_large.svg" />
					</div>
					<div>CoodFort</div>
				</div>
				{this.state.exhibit === ExhibitViewCode.none ||
				this.state.exhibit === ExhibitViewCode.enterToken ? (
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
			</div>
		);
	}
	render(): ReactNode {
		//window.Telegram.WebApp.expand();

		return this.state.loggedInToken === undefined ? (
			this.renderNoToken()
		) : (
			<></>
		);
	}
}
