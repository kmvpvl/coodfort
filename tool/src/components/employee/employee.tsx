import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./employee.css";
import { EateryRoleCode, IEmployee } from "@betypes/eaterytypes";
import { IUser } from "@betypes/prototypes";
import "react-data-grid/lib/styles.css";

export interface IEmployeeProps extends IProtoProps {
	defaultValue: IEmployee;
}

export interface IEmployeeState extends IProtoState {
	value: IEmployee;
	user?: IUser;
}

export default class Employee extends Proto<IEmployeeProps, IEmployeeState> {
	state: IEmployeeState = {
		value: this.props.defaultValue,
	};
	componentDidMount(): void {
		this.loadUserInfo();
	}
	loadUserInfo() {
		this.serverCommand(
			"user/view",
			JSON.stringify({ id: this.state.value.userId }),
			res => {
				console.log(res);
				if (res.ok) {
					this.setState({ ...this.state, user: res.user });
				}
			},
			err => {
				console.log(err);
			}
		);
	}
	updateEmployeeCapabilities(roles?: EateryRoleCode[], block?: boolean) {
		const res = this.state.value;
		if (roles !== undefined) res.roles = roles;
		if (block !== undefined) res.blocked = block;
		this.serverCommand(
			"eatery/employee/update",
			JSON.stringify(res),
			res => {
				console.log(res);
				if (res.ok) {
				}
			},
			err => {
				console.log(err);
			}
		);
	}
	render(): ReactNode {
		return (
			<div className="employee-container">
				<div>
					{this.state.user?.login}: {this.state.user?.name}
					<button
						onClick={((event: any) => {
							this.updateEmployeeCapabilities(undefined, !this.state.value.blocked);
						}).bind(this)}>
						{this.state.value.blocked ? "Unb" : "B"}lock user
					</button>
				</div>
				<div>{this.state.user?.bios}</div>
				<div>
					<span>Roles</span>
					<div className="employee-roles-list">
						<span
							dangerouslySetInnerHTML={{ __html: "Drop new<br>role here" }}
							onDragEnter={event => {
								event.preventDefault();
								event.currentTarget.classList.toggle("ready-to-drop", true);
								event.dataTransfer.dropEffect = "link";
							}}
							onDragOver={event => {
								event.preventDefault();
								event.dataTransfer.dropEffect = "link";
							}}
							onDragLeave={event => {
								event.preventDefault();
								event.currentTarget.classList.toggle("ready-to-drop", false);
								event.dataTransfer.dropEffect = "link";
							}}
							onDragEnd={event => {
								event.preventDefault();
								event.currentTarget.classList.toggle("ready-to-drop", false);
								event.dataTransfer.dropEffect = "link";
							}}
							onDrop={event => {
								event.preventDefault();
								const role = JSON.parse(event.dataTransfer.getData("coodfort/role"));
								event.currentTarget.classList.toggle("ready-to-drop", false);
								console.log(role);
								const roles = JSON.parse(JSON.stringify(this.state.value.roles));
								roles.push(role.role);
								this.updateEmployeeCapabilities(roles);
							}}></span>
						{this.state.value.roles.map((role, idx) => (
							<span key={idx}>
								<span>{role}</span>
								<span className="context-toolbar">
									<span
										onClick={event => {
											const roles = JSON.parse(JSON.stringify(this.state.value.roles));
											roles.splice(idx, 1);
											this.updateEmployeeCapabilities(roles);
										}}>
										⤬
									</span>
								</span>
							</span>
						))}
					</div>
				</div>
				<div className="context-toolbar">
					<span>_</span>
				</div>
			</div>
		);
	}
}
