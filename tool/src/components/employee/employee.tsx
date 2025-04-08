import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./employee.css";
import { EateryRoleCode, IEatery, IEmployee } from "@betypes/eaterytypes";
import { IUser } from "@betypes/prototypes";
import "react-data-grid/lib/styles.css";
import { ToastType } from "../toast";

export interface IEmployeeProps extends IProtoProps {
	defaultValue: IEmployee;
	onChange?: (eatery: IEatery) => void;
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
				if (res.ok) {
					this.setState({ ...this.state, user: res.user });
				}
			},
			err => {}
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
				if (res.ok) {
					//debugger
					if (this.props.onChange !== undefined) this.props.onChange(res.eatery);
					this.setState(this.state);
				}
			},
			err => {
				switch (err.json.httpCode) {
					case 403:
						this.props.toaster?.current?.addToast({
							type: ToastType.error,
							modal: true,
							message: `In response to an attempt to update the list of roles, the system sent the following message: ${err.json.message}. See the full description`,
							description: JSON.stringify(err.json),
						});
						break;
					default:
				}
			}
		);
	}
	render(): ReactNode {
		return (
			<div className="employee-container has-caption">
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1em" }}>
					<div className="caption">{this.state.user?.name}</div>
					<div className="has-label">
						<div className="label">Login</div>
						<div>{this.state.user?.login}</div>
					</div>
					<span
						className="drop-zone"
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
							if (!roles.includes(role.role)) roles.push(role.role);
							this.updateEmployeeCapabilities(roles);
							roles.pop();
						}}></span>
				</div>
				<div>{this.state.user?.bios}</div>
				<div className="has-caption">
					<div className="caption">Roles</div>
					<div className="employee-roles-list">
						{this.state.value.roles.map((role, idx) => (
							<div className="has-caption" key={idx}>
								<div>{role}</div>
								<div className="toolbar">
									<span
										onClick={event => {
											const roles = JSON.parse(JSON.stringify(this.state.value.roles));
											if (roles.at(idx) === EateryRoleCode.owner) {
												this.props.toaster?.current?.addToast({
													type: ToastType.warning,
													modal: true,
													message: "Removing the role 'owner' may result in loss of access to restaurant data. Restoring access is only possible through support and may take a long time. Are you sure you want to remove the role?",
													buttons: [
														{
															text: this.ML("Yes"),
															callback: (() => {
																roles.splice(idx, 1);
																this.updateEmployeeCapabilities(roles);
															}).bind(this),
														},
														{ text: this.ML("No"), callback: () => {} },
													],
												});
											} else {
												roles.splice(idx, 1);
												this.updateEmployeeCapabilities(roles);
											}
										}}>
										<span style={{ transform: "rotate(45deg)", display: "block" }}>+</span>
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="toolbar">
					<span>_</span>
					<span
						onClick={((event: any) => {
							this.updateEmployeeCapabilities(undefined, !this.state.value.blocked);
						}).bind(this)}>
						{this.state.value.blocked ? "Unb" : "B"}lock user
					</span>
				</div>
			</div>
		);
	}
}
