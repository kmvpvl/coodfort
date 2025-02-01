import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import { IUser, IWfNextRequest, Types, WorkflowStatusCode } from "@betypes/prototypes";
import "./dispatcher.css";
import { EateryRoleCode, IEatery, IEateryBrief, IMeal, IMenu } from "@betypes/eaterytypes";
import Logo from "../logo/logo";
import { Eatery } from "../eatery/eatery";
import { IOrder, IOrderItem, ITableCallWaiterSignal } from "@betypes/ordertypes";
import { ToastType } from "../toast";
import Pending from "../pending";
import Menu from "../menu/menu";
import Meal from "../menu/meal";
import ApproveOrderItems from "./approveOrderItems";
import ProcessingOrderItems from "./processingOrderItems";
import Table from "../table/table";
import Employees from "./employees";

export interface IDispatcherProps extends IProtoProps {
	employee: IUser;
}
export interface IDispatcherState extends IProtoState {
	eateriesBrief: Array<IEateryBrief | undefined>;
	eateryIdSelected?: Types.ObjectId;
	eaterySelected?: IEatery;
	mode?: LeftMenuItemIdCode;
	meals: Array<IMeal | undefined>;
	menus: Array<IMenu | undefined>;
	orders: Array<IOrder>;
	selectedOrderItemsToApprove?: Set<number>;
	selectedOrderItemsToFulfill?: Set<number>;
	tableCallWaiterSignals?: ITableCallWaiterSignal[];
}

enum LeftMenuItemIdCode {
	orderApprove,
	orderProcessing,
	orderReview,
	waiterCalls,
	orderBalance,
	eateryData,
	meals,
	menus,
	employees,
	guests,
	qrs,
}

const leftMenu = [
	{ name: "OPERATIONS" },
	{ id: LeftMenuItemIdCode.waiterCalls, name: "Waiter calls" },
	{ id: LeftMenuItemIdCode.orderBalance, name: "Orders balance" },
	{ id: LeftMenuItemIdCode.orderApprove, name: "Orders approve" },
	{ id: LeftMenuItemIdCode.orderProcessing, name: "Orders processing" },
	{ id: LeftMenuItemIdCode.orderReview, name: "Orders review" },
	{ name: "MASTER DATA" },
	{ id: LeftMenuItemIdCode.eateryData, name: "Eatery data" },
	{ id: LeftMenuItemIdCode.qrs, name: "QRs" },
	{ id: LeftMenuItemIdCode.meals, name: "Meals" },
	{ id: LeftMenuItemIdCode.menus, name: "Menus" },
	{ id: LeftMenuItemIdCode.employees, name: "Employees" },
	{ id: LeftMenuItemIdCode.guests, name: "Guests" },
];

export default class Dispatcher extends Proto<IDispatcherProps, IDispatcherState> {
	state: IDispatcherState = {
		eateriesBrief: [],
		meals: [],
		menus: [],
		orders: [],
	};
	componentDidMount(): void {
		this.updateEateriesList();
		this.updateMealsList();
		this.updateMenusList();
	}
	updateEateriesList() {
		this.serverCommand(
			"user/eateriesList",
			undefined,
			res => {
				if (res.ok) {
					this.setState({ ...this.state, eateriesBrief: res.eateries });
				}
			},
			err => {}
		);
	}

	updateMealsList() {
		this.serverCommand(
			"user/mealsList",
			undefined,
			res => {
				if (res.ok) {
					this.setState({ ...this.state, meals: res.meals });
				}
			},
			err => {}
		);
	}

	updateMenusList() {
		this.serverCommand(
			"user/menusList",
			undefined,
			res => {
				if (res.ok) {
					this.setState({ ...this.state, menus: res.menus });
				}
			},
			err => {}
		);
	}

	loadOrdersList(eateryId: Types.ObjectId) {
		this.serverCommand(
			"eatery/ordersList",
			JSON.stringify({ eateryId: eateryId, wfStatuses: [WorkflowStatusCode.draft, WorkflowStatusCode.approved] }),
			res => {
				if (res.ok) {
					this.setState({ ...this.state, orders: res.orders });
				}
			},
			err => {
				if (err.json.httpCode !== undefined) {
					switch (err.json.httpCode) {
						case 403:
							this.props.toaster?.current?.addToast({ type: ToastType.error, message: "Call the owner. Role 'sous-chief' expected" });
					}
				}
			}
		);
	}

	loadTableCallWaiterSignals() {
		if (this.state.eaterySelected !== undefined) {
			this.serverCommand(
				"eatery/tableCallWaiterSignals",
				JSON.stringify({ tableIds: this.state.eaterySelected.tables.map(table => table.id) }),
				res => {
					const nState = this.state;
					nState.tableCallWaiterSignals = res.tableCallWaiterSignals;
					this.setState(nState);
				},
				err => {}
			);
		} else {
		}
	}

	loadEatery(id: Types.ObjectId) {
		this.serverCommand(
			"eatery/view",
			JSON.stringify({ id: id }),
			res => {
				if (res.ok) {
					const nState = this.state;
					nState.eaterySelected = res.eatery;
					this.setState(nState);
					this.loadTableCallWaiterSignals();
				}
			},
			err => {}
		);
	}

	onEaterySelect(eatery: IEatery) {
		console.log(eatery);
		const nState = this.state;
		nState.eateryIdSelected = eatery.id;
		nState.eaterySelected = undefined;
		this.setState(nState);
		if (eatery.id !== undefined) {
			this.loadEatery(eatery.id);
			this.loadOrdersList(eatery.id);
		}
	}

	onLeftMenuSelected(item: LeftMenuItemIdCode) {
		this.setState({ ...this.state, mode: item });
	}

	calcBadge(item?: LeftMenuItemIdCode): ReactNode {
		let ret;
		switch (item) {
			case LeftMenuItemIdCode.waiterCalls:
				ret = this.state.tableCallWaiterSignals?.filter(signal => signal.on).length;
				break;
			case LeftMenuItemIdCode.orderBalance:
				ret = this.state.orders.length;
				break;
			case LeftMenuItemIdCode.orderApprove:
				ret = this.state.orders.reduce((prev, order) => prev + order.items.filter(item => item.wfStatus === WorkflowStatusCode.registered).length, 0);
				break;
			case LeftMenuItemIdCode.orderProcessing:
				ret = this.state.orders.reduce((prev, order) => prev + order.items.filter(item => item.wfStatus === WorkflowStatusCode.approved).length, 0);
				break;
			case LeftMenuItemIdCode.orderReview:
				ret = this.state.orders.reduce((prev, order) => prev + order.items.filter(item => item.wfStatus === WorkflowStatusCode.review).length, 0);
				break;
			case LeftMenuItemIdCode.meals:
				ret = this.state.meals.length;
				break;
			case LeftMenuItemIdCode.menus:
				ret = this.state.menus.length;
				break;
			case LeftMenuItemIdCode.employees:
				ret = this.state.eaterySelected?.employees.length;
				break;
		}
		return ret === undefined || ret === 0 ? <></> : <span className="badge">{ret}</span>;
	}

	renderMiddle(): ReactNode {
		let ret: ReactNode;
		switch (this.state.mode) {
			case LeftMenuItemIdCode.qrs:
				return <div className="dispatcher-calls-container">{this.state.eaterySelected?.tables.map((table, idx) => <Table key={`qr_${idx}`} defaultValue={table} toaster={this.props.toaster} showQR={true} />)}</div>;
			case LeftMenuItemIdCode.waiterCalls:
				return <div className="dispatcher-calls-container">{this.state.eaterySelected?.tables.map((table, idx) => <Table key={`call_${idx}`} defaultValue={table} toaster={this.props.toaster} />)}</div>;
			case LeftMenuItemIdCode.orderBalance:
				return (
					<div className="dispatcher-order-balance-container">
						<div className="standalone-toolbar">
							<span>+</span>
						</div>
						<div className="dispatcher-order-balance-table-list">
							{this.state.eaterySelected?.tables.map((table, idx) => <Table key={`balance_${idx}`} defaultValue={table} orders={this.state.orders.filter(order => order.tableId === table.id)} toaster={this.props.toaster} />)}
						</div>
					</div>
				);
			case LeftMenuItemIdCode.orderApprove:
				return (
					<ApproveOrderItems
						onApprove={items => {
							this.serverCommand(
								"order/itemWfNext",
								JSON.stringify({ orderItemIds: items }),
								res => {
									if (!res.ok) return;
									const nState = this.state;
									const items: IOrderItem[] = res.orderItems;
									if (this.state.eateryIdSelected !== undefined) this.loadOrdersList(this.state.eateryIdSelected);
								},
								err => {
									this.props.toaster?.current?.addToast({ type: ToastType.error, message: err.json.message, modal: true });
								}
							);
						}}
						onCancel={items => {
							this.serverCommand(
								"order/itemWfNext",
								JSON.stringify({ orderItemIds: items }),
								res => {
									if (!res.ok) return;
									const nState = this.state;
									const items: IOrderItem[] = res.orderItems;
									if (this.state.eateryIdSelected !== undefined) this.loadOrdersList(this.state.eateryIdSelected);
								},
								err => {
									this.props.toaster?.current?.addToast({ type: ToastType.error, message: err.json.message, modal: true });
								}
							);
						}}
						orders={this.state.orders}
					/>
				);

				break;

			case LeftMenuItemIdCode.orderProcessing:
				return (
					<ProcessingOrderItems
						onFulfill={items => {
							this.serverCommand(
								"order/itemWfNext",
								JSON.stringify({ orderItemIds: items }),
								res => {
									if (!res.ok) return;
									const nState = this.state;
									const items: IOrderItem[] = res.orderItems;
									if (this.state.eateryIdSelected !== undefined) this.loadOrdersList(this.state.eateryIdSelected);
								},
								err => {
									this.props.toaster?.current?.addToast({ type: ToastType.error, message: err.json.message, modal: true });
								}
							);
						}}
						orders={this.state.orders}
					/>
				);

				break;
			case LeftMenuItemIdCode.menus:
				return (
					<div className="dispatcher-menus-container">
						<div className="standalone-toolbar">
							<span
								onClick={event => {
									const nState = this.state;
									nState.menus.push(undefined);
									this.setState(nState);
								}}>
								+
							</span>
							<input placeholder="filter" />
						</div>
						<div className="dispatcher-menus-list">
							{this.state.menus.map((menu, idx) => (
								<Menu key={idx} admin={true} defaultValue={menu} />
							))}
						</div>
					</div>
				);
				break;
			case LeftMenuItemIdCode.meals:
				return (
					<div className="dispatcher-meals-container">
						<div className="standalone-toolbar">
							<span
								onClick={event => {
									const nState = this.state;
									nState.meals.push(undefined);
									this.setState(nState);
								}}>
								+
							</span>
							<input placeholder="filter" />
						</div>
						<div className="dispatcher-meals-list">
							{this.state.meals.map((meal, idx) => (
								<Meal key={idx} admin={true} defaultValue={meal} />
							))}
						</div>
					</div>
				);
				break;
			case LeftMenuItemIdCode.eateryData:
				//if (this.state.eaterySelected !== undefined)
				return <Eatery key={this.state.eaterySelected?.id} defaultValue={this.state.eaterySelected} admin={true} editMode={true} />;
				break;
			case LeftMenuItemIdCode.employees:
				return this.state.eaterySelected !== undefined ? <Employees eatery={this.state.eaterySelected} /> : <></>;
				break;
			default:
				ret = <></>;
		}
		return ret;
	}

	renderRight(): ReactNode {
		let ret: ReactNode;
		switch (this.state.mode) {
			case LeftMenuItemIdCode.employees:
				return (
					<div className="roles-picker-container">
						{Object.keys(EateryRoleCode).map((role, idx) => (
							<div
								className="role-container"
								key={idx}
								draggable={true}
								onDragStart={event => {
									event.dataTransfer.setData("coodfort/role", JSON.stringify({ role: role }));
									console.log("dragstart", event);
								}}>
								{role}
							</div>
						))}
					</div>
				);
			case LeftMenuItemIdCode.menus:
				if (this.state.eaterySelected !== undefined)
					return (
						<div className="dispatcher-right-meals-container">
							<div>Available meals</div>
							<div>
								{this.state.meals.map((meal, idx) => (
									<Meal key={idx} defaultValue={meal} viewMode={ViewModeCode.compact} />
								))}
							</div>
						</div>
					);
				break;
			case LeftMenuItemIdCode.eateryData:
				if (this.state.eaterySelected !== undefined)
					return (
						<div>
							<div>Available menus</div>
							{this.state.menus.map((menu, idx) => (
								<Menu key={idx} defaultValue={menu} viewMode={ViewModeCode.compact} />
							))}
						</div>
					);
				break;
			default:
				ret = <></>;
		}
		return ret;
	}

	render(): ReactNode {
		return (
			<div className="dispatcher-container">
				<div className="dispatcher-header-container">
					<div className="dispatcher-logo-container">
						<Logo viewMode={ViewModeCode.compact} width="50px" />
					</div>
					<div className="dispatcher-eateries-container">
						{this.state.eateriesBrief.map((eatery, idx) => (
							<div className={`dispatcher-eateries-eatery-container ${eatery?.id === this.state.eateryIdSelected ? "selected" : ""}`} key={idx}>
								<Eatery className="" viewMode={ViewModeCode.compact} defaultValue={eatery} onClick={this.onEaterySelect.bind(this)} />
								<div className="context-toolbar">
									{
										//<span>X</span>
									}
								</div>
							</div>
						))}
						<div className="dispatcher-eateries-eatery-container">
							<span
								onClick={event => {
									const nState = this.state;
									if (!nState.eateriesBrief.includes(undefined)) nState.eateriesBrief.push(undefined);
									this.state.mode = LeftMenuItemIdCode.eateryData;
									this.state.eaterySelected = undefined;
									this.setState(nState);
								}}>
								+
							</span>
						</div>
					</div>
					<div className="dispatcher-user-container">
						<span>{this.props.employee.name}</span>
					</div>
				</div>
				{this.state.eateryIdSelected !== undefined || this.state.eateriesBrief.includes(undefined) ? (
					<div className="dispatcher-content-container">
						<div className="dispatcher-content-leftmenu">
							<div>
								<span>{this.toString(this.state.eaterySelected?.name)}</span>
								<span>|||</span>
							</div>
							{leftMenu.map((menuitem, idx) =>
								"id" in menuitem ? (
									<div
										className={`dispatcher-menu-item ${this.state.mode === menuitem.id ? "selected" : ""}`}
										data-menu-id={menuitem.id}
										key={idx}
										onClick={event => {
											const item_str = event.currentTarget.attributes.getNamedItem("data-menu-id")?.value;
											if (item_str !== undefined) {
												this.onLeftMenuSelected(parseInt(item_str));
											}
										}}>
										<span>{menuitem.name}</span>
										{this.calcBadge(menuitem.id)}
									</div>
								) : (
									<div key={idx} className="dispatcher-menu-separator">
										{menuitem.name}
									</div>
								)
							)}
						</div>
						<div className="dispatcher-content-left-sizer"></div>
						<div className="dispatcher-content-middle">{this.renderMiddle()}</div>
						<div className="dispatcher-content-right-sizer"></div>
						<div className="dispatcher-content-rightmenu">{this.renderRight()}</div>
					</div>
				) : (
					<div>Choose any eatery or create one</div>
				)}
				<Pending ref={this.pendingRef} />
			</div>
		);
	}
}
