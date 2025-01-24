import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import "./employee.css";
import { IEateryBrief, IMeal, IMenu } from "@betypes/eaterytypes";
import Meal from "../menu/meal";
import { Eatery } from "../eatery/eatery";
import Menu from "../menu/menu";
import { IUser, IWfNextRequest, WorkflowStatusCode } from "@betypes/prototypes";
import { IOrder, IOrderItem } from "@betypes/ordertypes";
import "react-data-grid/lib/styles.css";
import DataGrid, { SelectColumn } from "react-data-grid";
import { ToastType } from "../toast";

type EmployeeFocus = "none" | "profile" | "eateries" | "meals" | "bookings" | "orders";

export interface IEmployeeProps extends IProtoProps {
	employee: IUser;
}

export interface IEmployeeState extends IProtoState {
	focus: EmployeeFocus;
	eateriesBrief: Array<IEateryBrief | undefined>;
	meals: Array<IMeal | undefined>;
	menus: Array<IMenu | undefined>;
	orders: Array<IOrder>;
	selectedOrderItemsToApprove?: Set<number>;
	selectedOrderItemsToFulfill?: Set<number>;
}

export default class Employee extends Proto<IEmployeeProps, IEmployeeState> {
	state: IEmployeeState = {
		focus: this.getCurrentFocus(),
		meals: [],
		eateriesBrief: [],
		menus: [],
		orders: [],
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
			case "orders":
				this.updateOrdersList();
				break;
			case "eateries":
				this.updateEateriesList();
				this.updateMenusList();
				break;
			case "meals":
				this.updateMealsList();
				this.updateMenusList();
				break;
		}
		this.setState(nState);
	}

	updateMealsList() {
		this.serverCommand(
			"user/mealsList",
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
				console.log(err.json);
			}
		);
	}
	updateMenusList() {
		this.serverCommand(
			"user/menusList",
			undefined,
			res => {
				console.log(res);
				if (res.ok) {
					const nState = this.state;
					nState.menus = res.menus;
					this.setState(nState);
				}
			},
			err => {
				console.log(err.json);
			}
		);
	}
	updateEateriesList() {
		this.serverCommand(
			"user/eateriesList",
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
				console.log(err.json);
			}
		);
	}
	updateOrdersList() {
		this.serverCommand(
			"eatery/ordersList",
			JSON.stringify({ id: 1 }),
			res => {
				console.log(res);
				if (res.ok) {
					const nState = this.state;
					nState.orders = res.orders;
					this.setState(nState);
				}
			},
			err => {
				console.log(err.json);
				if (err.json.httpCode !== undefined) {
					switch (err.json.httpCode) {
						case 403:
							this.props.toaster?.current?.addToast({ type: ToastType.error, message: "Call the owner. Role 'sous-chief' expected" });
					}
				}
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
				<div className="employee-eateries-menus-palette-container">
					{this.state.menus.map((menu, idx) => (
						<Menu key={idx} defaultValue={menu} viewMode={ViewModeCode.compact} />
					))}
				</div>
			</div>
		);
	}
	renderMEALSFocus(): ReactNode {
		return (
			<div className="employee-menus-and-meals-container">
				<div className="employee-meals-container has-caption">
					<div className="caption">Meals</div>
					<div className="toolbar">
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
				<div
					style={{ cursor: "n-resize", height: "5px" }}
					onTouchStart={event => {
						console.log(event);
					}}></div>
				<div className="employee-menus-container has-caption">
					<div className="caption">Menus</div>
					<div className="toolbar">
						<span
							onClick={event => {
								const nState = this.state;
								nState.menus.push(undefined);
								this.setState(nState);
							}}>
							+
						</span>
						<span>⤢</span>
					</div>
					<div className="employee-menus-list">
						{this.state.menus.map((menu, idx) => (
							<Menu key={idx} defaultValue={menu} admin={true} editMode={true} />
						))}
					</div>
				</div>
			</div>
		);
	}
	renderORDERSFocus(): ReactNode {
		const toApproveRows = [];
		const toFulfillRows = [];
		const allRows = [];
		for (const order of this.state.orders) {
			toApproveRows.push(
				...order.items
					.filter(item => item.wfStatus === WorkflowStatusCode.registered)
					.map(item => {
						return {
							name: this.toString(item.name),
							id: order.id,
							orderItemId: item.id,
							created: new Date(item.created as unknown as string).toLocaleTimeString(),
							stage: item.wfStatus,
							optionName: this.toString(item.option.name),
							count: item.count,
						};
					})
			);
			toFulfillRows.push(
				...order.items
					.filter(item => item.wfStatus === WorkflowStatusCode.approved)
					.map(item => {
						return {
							name: this.toString(item.name),
							id: order.id,
							orderItemId: item.id,
							created: new Date(item.created as unknown as string).toLocaleTimeString(),
							stage: item.wfStatus,
							optionName: this.toString(item.option.name),
							count: item.count,
						};
					})
			);
		}
		//debugger
		return (
			<div className="employee-orders-container">
				Approve waiting
				<button
					onClick={event => {
						if (this.state.selectedOrderItemsToApprove !== undefined)
							this.serverCommand(
								"order/itemWfNext",
								JSON.stringify({ orderItemIds: Array.from(this.state.selectedOrderItemsToApprove).map<IWfNextRequest>(v => ({ id: v, nextWfStatus: WorkflowStatusCode.approved })) }),
								res => {
									console.log(res);
									if (!res.ok) return;
									const nState = this.state;
									const items: IOrderItem[] = res.orderItems;
									this.updateOrdersList();
								},
								err => {
									this.props.toaster?.current?.addToast({ type: ToastType.error, message: err.json.message, modal: true });
									console.log(err.json);
								}
							);
						this.setState({ ...this.state, selectedOrderItemsToApprove: undefined });
					}}>
					Approve
				</button>
				<button
					onClick={event => {
						if (this.state.selectedOrderItemsToApprove !== undefined)
							this.serverCommand(
								"order/itemWfNext",
								JSON.stringify({ orderItemIds: Array.from(this.state.selectedOrderItemsToApprove).map<IWfNextRequest>(v => ({ id: v, nextWfStatus: WorkflowStatusCode.canceledByEatery })) }),
								res => {
									console.log(res);
									if (!res.ok) return;
									const nState = this.state;
									const items: IOrderItem[] = res.orderItems;
									this.updateOrdersList();
								},
								err => {
									this.props.toaster?.current?.addToast({ type: ToastType.error, message: err.json.message, modal: true });
									console.log(err.json);
								}
							);
						this.setState({ ...this.state, selectedOrderItemsToApprove: undefined });
					}}>
					Reject
				</button>
				<DataGrid
					isRowSelectionDisabled={row => false}
					columns={[
						SelectColumn,
						{ key: "id", name: "Order#" },
						{ key: "orderItemId", name: "OrderItem#" },
						{ key: "stage", name: "Stage" },
						{ key: "name", name: "Meal", resizable: true, width: "20%" },
						{ key: "optionName", name: "Option" },
						{ key: "count", name: "Count" },
						{ key: "created", name: "Created", sortable: true },
					]}
					rows={toApproveRows}
					sortColumns={[{ columnKey: "created", direction: "DESC" }]}
					onSelectedRowsChange={cells => {
						console.log(cells);
						this.setState({ ...this.state, selectedOrderItemsToApprove: cells });
					}}
					rowKeyGetter={row => row.orderItemId as number}
					selectedRows={this.state.selectedOrderItemsToApprove}
				/>
				Fulfilling orders
				<button
					onClick={event => {
						if (this.state.selectedOrderItemsToFulfill !== undefined)
							this.serverCommand(
								"order/itemWfNext",
								JSON.stringify({ orderItemIds: Array.from(this.state.selectedOrderItemsToFulfill).map<IWfNextRequest>(v => ({ id: v, nextWfStatus: WorkflowStatusCode.done })) }),
								res => {
									console.log(res);
									if (!res.ok) return;
									const nState = this.state;
									const items: IOrderItem[] = res.orderItems;
									this.updateOrdersList();
								},
								err => {
									this.props.toaster?.current?.addToast({ type: ToastType.error, message: err.json.message, modal: true });
									console.log(err.json);
								}
							);
						this.setState({ ...this.state, selectedOrderItemsToFulfill: undefined });
					}}>
					Ready
				</button>
				<DataGrid
					isRowSelectionDisabled={row => false}
					columns={[
						SelectColumn,
						{ key: "id", name: "Order#" },
						{ key: "orderItemId", name: "OrderItem#" },
						{ key: "stage", name: "Stage" },
						{ key: "name", name: "Meal", resizable: true, width: "20%" },
						{ key: "optionName", name: "Option" },
						{ key: "count", name: "Count" },
						{ key: "created", name: "Created", sortable: true },
					]}
					rows={toFulfillRows}
					sortColumns={[{ columnKey: "created", direction: "DESC" }]}
					onSelectedRowsChange={cells => {
						console.log(cells);
						this.setState({ ...this.state, selectedOrderItemsToFulfill: cells });
					}}
					rowKeyGetter={row => row.orderItemId as number}
					selectedRows={this.state.selectedOrderItemsToFulfill}
				/>
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
			case "orders":
				focusContent = this.renderORDERSFocus();
				break;
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
