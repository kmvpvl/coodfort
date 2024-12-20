import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./employee.css";
import { IEatery, IEmployee, IMeal } from "@betypes/eaterytypes";
import { Types } from "@betypes/prototypes";

type EmployeeFocus = "none" | "profile" | "eateries" | "meals" | "bookings" | "orders";

export interface IEmployeeProps extends IProtoProps {
	employee: IEmployee;
	eateriesChanged?: (selectedEateryId?: Types.ObjectId) => void;
	mealsChanged?: (selectedMealId?: Types.ObjectId) => void;
}

export interface IEmployeeState extends IProtoState {
	focus: EmployeeFocus;
	currentEateryId?: Types.ObjectId;
	currentMealId?: Types.ObjectId;
	eateries?: IEatery[];
	meals?: IMeal[];
}

export default class Employee extends Proto<IEmployeeProps, IEmployeeState> {
	state: IEmployeeState = {
		focus: this.getCurrentFocus(),
	};
	getCurrentFocus(): EmployeeFocus {
		const ls: any = localStorage.getItem("coodfort_employee_focus");
		if (!ls) return "none";
		return ls;
	}
	onSelectFocus(event: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
		const focus = event.currentTarget.getAttribute("data-focus");
		if (focus) this.selectFocus(focus as EmployeeFocus);
	}
	selectFocus(newFocus: EmployeeFocus) {
		const nState = this.state;
		nState.focus = newFocus;
		this.setState(nState);
	}
	newEatery() {
		const newEatery: IEatery = {
			name: "New Eatery",
			tables: [],
			deliveryPartnerIds: [],
			employees: [],
			entertainmentIds: [],
		};
		this.serverCommand("eatery/new", JSON.stringify(newEatery), res => {
			if (res.ok) {
				if (this.props.eateriesChanged !== undefined) this.props.eateriesChanged(res.eatery.id);
			}
		});
	}
	updateEateriesList() {}
	renderEATERIESFocus(): ReactNode {
		return (
			<div className="eateries-container has-caption">
				<div className="caption">My eateries</div>
				<div className="toolbar">
					<span onClick={this.newEatery.bind(this)}>+</span>
				</div>
			</div>
		);
	}
	renderNONEFocus(): ReactNode {
		return <div>Choose any tab</div>;
	}
	render(): ReactNode {
		const curFocus = this.state.focus;
		let focusContent: ReactNode;
		switch (curFocus) {
			case "eateries":
				focusContent = this.renderEATERIESFocus();
				break;
			case "none":
			default:
				focusContent = this.renderNONEFocus();
		}
		return (
			<div className="employee-container">
				<div>{this.props.employee.name}</div>
				<div>
					<span className={`employee-focus-item${curFocus === "orders" ? " selected" : ""}`} data-focus="orders" onClick={this.onSelectFocus.bind(this)}>
						Orders
					</span>
					<span>Profile</span>
					<span className={`employee-focus-item${curFocus === "eateries" ? " selected" : ""}`} data-focus="eateries" onClick={this.onSelectFocus.bind(this)}>
						Eateries
					</span>
					<span>Meals</span>
					<span>Bookings</span>
				</div>
				{focusContent}
			</div>
		);
	}
}
