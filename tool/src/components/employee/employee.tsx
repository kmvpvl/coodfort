import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./employee.css";
import { IEateryBrief, IEmployee, IMeal } from "@betypes/eaterytypes";
import Meal from "../menu/meal";
import { Eatery } from "../eatery/eatery";

type EmployeeFocus = "none" | "profile" | "eateries" | "meals" | "bookings" | "orders";

export interface IEmployeeProps extends IProtoProps {
	employee: IEmployee;
}

export interface IEmployeeState extends IProtoState {
	focus: EmployeeFocus;
	eateriesBrief: Array<IEateryBrief | undefined>;
	meals: Array<IMeal | undefined>;
}

export default class Employee extends Proto<IEmployeeProps, IEmployeeState> {
	state: IEmployeeState = {
		focus: this.getCurrentFocus(),
		meals: [],
		eateriesBrief: [],
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
		switch (nState.focus) {
			case "eateries":
				this.updateEateriesList();
				break;
			case "meals":
				this.updateMealsList();
				break;
		}
		this.setState(nState);
	}

	updateMealsList() {
		this.serverCommand(
			"employee/mealsList",
			undefined,
			res => {
				console.log(res);
				if (res.ok) {
					const nState = this.state;
					nState.meals = res.meals;
					this.setState(nState);
				}
			},
			err => {
				console.log(err);
			}
		);
	}
	updateEateriesList() {
		this.serverCommand(
			"employee/eateriesList",
			undefined,
			res => {
				console.log(res);
				if (res.ok) {
					const nState = this.state;
					nState.eateriesBrief = res.eateries;
					this.setState(nState);
				}
			},
			err => {
				console.log(err);
			}
		);
	}
	renderEATERIESFocus(): ReactNode {
		return (
			<div className="employee-eateries-container">
				<div className="employee-eateries-toolbar">
					<span
						onClick={event => {
							const nState = this.state;
							nState.eateriesBrief.push(undefined);
							this.setState(nState);
						}}>
						+
					</span>
				</div>
				<div className="employee-eateries-list">
					{this.state.eateriesBrief.map((eatery, idx) => (
						<Eatery key={idx} defaultValue={eatery} admin={true} />
					))}
				</div>
			</div>
		);
	}
	renderMEALSFocus(): ReactNode {
		return (
			<div className="employee-meals-container">
				<div className="employee-meals-toolbar">
					<span
						onClick={event => {
							const nState = this.state;
							nState.meals.push(undefined);
							this.setState(nState);
						}}>
						+
					</span>
					<span>⤢</span>
				</div>
				<div className="employee-meals-list">
					{this.state.meals.map((meal, idx) => (
						<Meal key={idx} defaultValue={meal} admin={true} />
					))}
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
			case "meals":
				focusContent = this.renderMEALSFocus();
				break;
			case "none":
			default:
				focusContent = this.renderNONEFocus();
		}
		return (
			<div className="employee-container">
				<div>{this.props.employee.name}</div>
				<div className="tabs-list" style={{ display: "grid", gridTemplateColumns: "auto auto auto auto auto 1fr" }}>
					<span className={`employee-focus-item${curFocus === "orders" ? " tab-list-tab-selected" : ""}`} data-focus="orders" onClick={this.onSelectFocus.bind(this)}>
						Orders
					</span>
					<span>Profile</span>
					<span className={`employee-focus-item${curFocus === "eateries" ? " tab-list-tab-selected" : ""}`} data-focus="eateries" onClick={this.onSelectFocus.bind(this)}>
						Eateries
					</span>
					<span className={`employee-focus-item${curFocus === "meals" ? " tab-list-tab-selected" : ""}`} data-focus="meals" onClick={this.onSelectFocus.bind(this)}>
						Meals
					</span>
					<span>Bookings</span>
					<span></span>
				</div>
				{focusContent}
			</div>
		);
	}
}
