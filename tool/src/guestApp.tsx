import { Types } from "@betypes/prototypes";
import { OrderFunelStages } from "@betypes/ordertypes";

import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ProtoErrorCode } from "./components/proto";
import "./guestApp.css";
import Pending from "./components/pending";
import Toaster from "./components/toast";
import React from "react";
import Logo from "./components/logo/logo";

export interface IGuestAppProps extends IProtoProps {
	mode?: string;
	eatery?: Types.ObjectId;
	table?: Types.ObjectId;
	itemMenu?: Types.ObjectId;
	order?: Types.ObjectId;
}

const OrderStages = ["Reservation", "Choose meals", "Payment", "Fulfillment"];

export interface IGuestAppState extends IProtoState {
	passwordWrong?: boolean;
}

export default class GuestApp extends Proto<IGuestAppProps, IGuestAppState> {
	protected toasterRef = React.createRef<Toaster>();

	state: IGuestAppState = {};
	componentDidMount(): void {
		this.login(undefined, undefined, err => {
			if (err.json.httpCode !== undefined) {
				// server returns http status
				switch (err.json.httpCode) {
					case 404:
						// new user
						break;
					case 401:
						// existing user wrong login
						const nState = this.state;
						nState.passwordWrong = true;
						this.setState(nState);
						break;
					default:
				}
			} else {
				// server not available
			}
		});
	}
	/**
	 * 3-state interface
	 * passwordWrong and user are undefined both - greetings new user
	 * passwordWrong is true and user is undefined - fault login attempt of existing user
	 * user is not undefined - successful login attempt
	 */
	renderGreetings(): ReactNode {
		const tgUser = "user" in window.Telegram.WebApp.initDataUnsafe ? window.Telegram.WebApp.initDataUnsafe.user : null;
		return (
			<div className="guest-app-greetings-container">
				<div style={{ textAlign: "center", fontSize: "120%" }}>Давайте познакомимся</div>
				<div>
					<span>{"Your default lang. We have other languages. Choose"}</span>
					<select defaultValue={tgUser?.language_code || this.getLanguage()}>
						{process.env.LANGUAGES?.split(",").map((lang, idx) => (
							<option key={idx} value={lang}>
								{lang}
							</option>
						))}
					</select>
				</div>
				<div className="guest-app-greetings-text">
					Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia,
					looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33
					of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit
					amet..", comes from a line in section 1.10.32.
				</div>
				<div className="guest-app-greetings-requisites">
					<div>
						{tgUser ? (
							<div style={{ height: "100%" }}>
								<img src={tgUser.photo_url} />
							</div>
						) : (
							<></>
						)}
					</div>
					<div>
						<div>{tgUser ? "We've got your name and photo from Telegram" : "Enter your name"}</div>
						<input id="name" type="text" style={{ width: "100%" }} defaultValue={tgUser ? [tgUser.first_name, tgUser.last_name].join(" ") : undefined} />
					</div>

					<div>
						<div>Say smth about you</div>
						<textarea id="bio" style={{ width: "100%" }} />
					</div>
				</div>
				<div>
					<button
						style={{ width: "100%" }}
						onClick={event => {
							this.serverCommand(
								"user/new",
								JSON.stringify({
									name: document.getElementById("name")?.nodeValue,
									bio: document.getElementById("bio")?.nodeValue,
								}),
								res => {
									console.log(res);
								},
								err => {
									console.log(err.json);
								}
							);
						}}>
						Everything is correct. Let's move on
					</button>
				</div>
			</div>
		);
	}
	renderWrongToken(): ReactNode {
		return (
			<div>
				<div style={{ textAlign: "center", fontSize: "120%" }}>Your credential are wrong. Try recover your token in Telegram</div>
				<div>
					There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of
					Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the
					Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected
					humour, or non-characteristic words etc.
				</div>
				<div>
					<button
						onClick={event => {
							localStorage.removeItem("coodforttoken");
							const nState = this.state;
							nState.passwordWrong = undefined;
							this.setState(nState);
						}}>
						I want create new user
					</button>
				</div>
				<div>
					<button>I want recover my token</button>
				</div>
			</div>
		);
	}
	renderNavTop(): ReactNode {
		return (
			<div className="guest-app-nav-top">
				<Logo />
			</div>
		);
	}
	renderNavBottom(): ReactNode {
		return <div className="guest-app-nav-bottom">{this.state.user !== undefined ? OrderStages.map((stage, idx) => <span key={idx}>{stage}</span>) : <></>}</div>;
	}
	render(): ReactNode {
		let content: ReactNode;
		if (this.state.user === undefined && !this.state.passwordWrong) {
			content = this.renderGreetings();
		} else if (this.state.user === undefined) {
			content = this.renderWrongToken();
		}
		return (
			<div className="guest-app-container">
				{this.renderNavTop()}
				{content}
				{this.renderNavBottom()}
				<Pending ref={this.pendingRef} />
				<Toaster placesCount={3} ref={this.toasterRef} />
			</div>
		);
	}
}
