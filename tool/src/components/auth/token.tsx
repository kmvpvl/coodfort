import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./token.css";
import { IEmployee } from "@betypes/eaterytypes";
import { ToastType } from "../toast";
export interface ITokenProps extends IProtoProps {
	onSingIn?: (employee: IEmployee) => void;
	onSignOut?: () => void;
}

export interface ITokenState extends IProtoState {
	signedIn: boolean;
}

export default class Token extends Proto<ITokenProps, ITokenState> {
	state: ITokenState = {
		signedIn: false,
	};
	tryLogin(login: string, password: string) {
		this.serverFetch(
			"employee/view",
			"POST",
			new Headers([
				["content-type", "application/json"],
				["coodfort-login", login],
				["coodfort-password", password],
			]),
			undefined,
			res => {
				const nState = this.state;
				nState.signedIn = true;
				this.setState(nState);
				console.log(res);
				if (res.ok) {
					if (this.props.onSingIn) this.props.onSingIn(res.employee);
				}
			},
			err => {
				console.log(err);
				const nState: ITokenState = this.state;
				this.props.toaster?.current?.addToast({type: ToastType.error, modal: true, message: err.message});
				this.setState(nState);
			}
		);
	}
	render(): ReactNode {
		return (
			<div className="token-container">
				{this.state.signedIn ? (
					<></>
				) : (
					<>
						<input
							type="password"
							placeholder={this.ML("Insert your token here")}
							onChange={event => {
								const token = event.currentTarget.value;
								const token_parts = token.split(":");
								const password = token_parts.pop();
								if (password !== undefined) {
									const login = token_parts.join(":");
									this.tryLogin(login, password);
								}
							}}></input>
						<button>Retry</button>
					</>
				)}
			</div>
		);
	}
}
