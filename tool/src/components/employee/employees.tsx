import { FormEvent, ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./employees.css";
import { IEatery } from "@betypes/eaterytypes";
import Employee from "./employee";
import { IUser } from "@betypes/prototypes";

export interface IEmployeesProps extends IProtoProps {
	eatery: IEatery;
	onChange?: (eatery: IEatery) => void;
}
export interface IEmployeesState extends IProtoState {
	eatery: IEatery;
	foundUser?: IUser;
}

export default class Employees extends Proto<IEmployeesProps, IEmployeesState> {
	state: IEmployeesState = {
		eatery: this.props.eatery,
	};
	findUser(event: FormEvent<HTMLInputElement>) {
		if (event.currentTarget.value.length < 3) {
			this.setState({ ...this.state, foundUser: undefined });
			return;
		}
		this.serverCommand(
			"user/find",
			JSON.stringify({
				firstLetters: event.currentTarget.value,
			}),
			res => {
				if (res.ok) {
					const nState = this.state;
					nState.foundUser = res.user;
					this.setState(nState);
					//debugger
					(document.getElementById("inviteUserLogin") as HTMLInputElement).value = res.user.login;
				} else {
					this.setState({ ...this.state, foundUser: undefined });
				}
			},
			err => {
				this.setState({ ...this.state, foundUser: undefined });
			}
		);
	}
	render(): ReactNode {
		return (
			<div className="employees-container">
				<div className="standalone-toolbar">
					<input type="checkbox" /> Hide blocked
					<input type="text" id="inviteUserLogin" onInput={this.findUser.bind(this)} defaultValue={this.state.foundUser?.login} />
					<button
						disabled={this.state.foundUser === undefined}
						onClick={event => {
							if (this.state.foundUser === undefined) return;
							this.serverCommand(
								"eatery/employee/update",
								JSON.stringify({
									userId: this.state.foundUser.id,
									eatery_id: this.state.eatery.id,
									roles: [],
								}),
								res => {
									if (res.ok) {
										if (this.props.onChange !== undefined) this.props.onChange(res.eatery);
										const nState = this.state;
										nState.eatery = res.eatery;
										this.setState(nState);
									}
								},
								err => {}
							);
						}}>
						invite
					</button>
					<input type="text" placeholder="filter" />
				</div>
				<div>
					{this.state.eatery.employees.map((empl, idx) => (
						<Employee key={idx} defaultValue={empl} />
					))}
				</div>
			</div>
		);
	}
}
