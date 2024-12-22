import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./employee.css";
import { IEatery, IEateryBrief, IEmployee, IMeal } from "@betypes/eaterytypes";
import { Types } from "@betypes/prototypes";
import { EateryThumb } from "../eatery/eateryThumb";
import Meal from "../menu/meal";
import { Eatery } from "../eatery/eatery";

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
	eateries?: IEateryBrief[];
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
				const nState = this.state;
				nState.currentEateryId = res.eatery.id;
				this.setState(nState);
				this.updateEateriesList();
			}
		});
	}
	newMeal() {
		const newMeal: IMeal = {
			name: "New meal",
			description: "",
			photos: [],
			options: [],
		};
		this.serverCommand("meal/new", JSON.stringify(newMeal), res => {
			if (res.ok) {
				if (this.props.mealsChanged !== undefined) this.props.mealsChanged(res.meal.id);
				const nState = this.state;
				nState.currentMealId = res.meal.id;
				this.setState(nState);
				this.updateMealsList();
			}
		});
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
					nState.eateries = res.eateries;
					this.setState(nState);
				}
			},
			err => {
				console.log(err);
			}
		);
	}
	renderEATERIESFocus(): ReactNode {
		let currentEatery: IEatery |undefined;
		if (this.state.currentEateryId !== undefined) {
			const idx = this.state.eateries?.findIndex(eatery=>eatery.id === this.state.currentEateryId)
			if (idx !== undefined && idx !== -1) currentEatery = this.state.eateries?.at(idx);
		}
		return (
			<div className="eateries-container has-caption">
				<div className="caption">My eateries</div>
				<div className="toolbar">
					<span onClick={this.newEatery.bind(this)}>+</span>
				</div>
				<div>
				{this.state.eateries?.map((eatery, idx) => <EateryThumb key={idx} eateryBrief={eatery} onSelect={(eatery=>{
					const nState = this.state;
					nState.currentEateryId = eatery.id;
					this.setState(nState);
				})}/>)}
				</div>
				<div>
					{currentEatery !== undefined?<Eatery eatery={currentEatery}/>:<></>}
				</div>
			</div>
		);
	}
	renderMEALSFocus(): ReactNode {
		return (
			<div className="meals-container has-caption">
				<div className="caption">My meals</div>
				<div className="toolbar">
					<span onClick={this.newMeal.bind(this)}>+</span>
				</div>
				<div>
				{this.state.meals?.map((meal, idx) => <Meal key={idx} meal={meal} admin={true} />)}
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
				<div>
					<span className={`employee-focus-item${curFocus === "orders" ? " selected" : ""}`} data-focus="orders" onClick={this.onSelectFocus.bind(this)}>
						Orders
					</span>
					<span>Profile</span>
					<span className={`employee-focus-item${curFocus === "eateries" ? " selected" : ""}`} data-focus="eateries" onClick={this.onSelectFocus.bind(this)}>
						Eateries
					</span>
					<span className={`employee-focus-item${curFocus === "meals" ? " selected" : ""}`} data-focus="meals" onClick={this.onSelectFocus.bind(this)}>
						Meals
					</span>
					<span>Bookings</span>
				</div>
				{focusContent}
			</div>
		);
	}
}
