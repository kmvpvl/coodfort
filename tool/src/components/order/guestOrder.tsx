import { Fragment, ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import { IOrder, IOrderItem, IOrderSumBalance } from "@betypes/ordertypes";
import "./guestOrder.css";
import { IWfHistoryItem, IWfNextRequest, Types, WorkflowStatusCode } from "@betypes/prototypes";
import { ToastType } from "../toast";
import { IEatery } from "@betypes/eaterytypes";
export interface IGuestOrderProps extends IProtoProps {
	defaultValue?: IOrder;
	viewMode?: ViewModeCode;
	orderId?: Types.ObjectId;
	eatery: IEatery;
	eateryId: Types.ObjectId;
	tableId: Types.ObjectId;
	onChange?: (order: IOrder) => void;
}
export interface IGuestOrderState extends IProtoState {
	value: IOrder;
	viewMode: ViewModeCode;
	changed?: boolean;
	hideCanceledOrderItems: boolean;
}

export default class GuestOrder extends Proto<IGuestOrderProps, IGuestOrderState> {
	state: IGuestOrderState = {
		value: this.props.defaultValue !== undefined ? this.props.defaultValue : this.new(),
		viewMode: this.props.viewMode !== undefined ? this.props.viewMode : ViewModeCode.compact,
		hideCanceledOrderItems: true,
	};
	get value(): IOrder {
		return this.state.value;
	}
	componentDidMount(): void {
		if (this.props.orderId !== undefined || this.state.value.id !== undefined) this.load();
	}
	componentDidUpdate(prevProps: Readonly<IGuestOrderProps>, prevState: Readonly<IGuestOrderState>, snapshot?: any): void {
		if (this.props.defaultValue !== undefined && this.props.defaultValue.id !== this.state.value.id) {
			const nState = this.state;
			nState.value = this.props.defaultValue;
			this.setState(nState);
		}
	}
	updateOrderItem(item: IOrderItem) {
		item.order_id = this.state.value.id;
		const nState = this.state;
		const oldOrNew = nState.value.items.findIndex(el => el.id === item.id);
		if (oldOrNew === -1) nState.value.items.push(item);
		else nState.value.items[oldOrNew] = item;
		this.setState(nState);
		if (this.state.value.id === undefined) this.save();
		else
			this.serverCommand(
				"order/itemUpdate",
				JSON.stringify(item),
				res => {
					if (res.ok) {
						const nState = this.state;
						nState.value = res.order;
						this.setState(nState);
					}
				},
				err => {}
			);
	}
	new(): IOrder {
		const ret = {
			eateryId: this.props.eateryId,
			tableId: this.props.tableId,
			items: [],
			payments: [],
			discount: 1,
		};
		return ret;
	}
	public load() {
		this.serverCommand(
			"order/view",
			JSON.stringify({ id: this.props.orderId === undefined ? this.state.value.id : this.props.orderId }),
			res => {
				if (!res.ok) return;
				const nState = this.state;
				nState.changed = false;
				nState.value = res.order;
				this.setState(nState);
			},
			err => {}
		);
	}

	protected save() {
		if (this.state.value.id === undefined)
			this.serverCommand(
				"order/new",
				JSON.stringify(this.state.value),
				res => {
					if (!res.ok) return;
					const nState = this.state;
					nState.value = res.order;
					nState.changed = false;
					this.setState(nState);
					if (this.props.onChange) this.props.onChange(this.state.value);
				},
				err => {}
			);
	}
	protected itemWfNext(item: IWfNextRequest) {
		/*if (this.props.eatery.approveRequiredToReserve && this.state.value.wfStatus == WorkflowStatusCode.draft) {
			this.props.toaster?.current?.addToast({
				type: ToastType.info,
				message: `Unable register the order 'cause order not approved by ${this.toString(this.props.eatery.name)}. Pls wait or call waiter`,
			});
			return;
		}*/
		this.serverCommand(
			"order/itemWfNext",
			JSON.stringify({ orderItemId: item }),
			res => {
				if (!res.ok) return;
				const nState = this.state;
				nState.value = res.order;
				this.setState(nState);
				if (this.props.onChange) this.props.onChange(this.state.value);
			},
			err => {
				this.props.toaster?.current?.addToast({ type: ToastType.error, message: `Unable register the order 'cause order not approved by ${this.toString(this.props.eatery.name)}. Pls wait or call waiter`, modal: true });
			}
		);
	}

	protected itemsWfNext(items: IWfNextRequest[]) {
		/*if (this.props.eatery.approveRequiredToReserve && this.state.value.wfStatus == WorkflowStatusCode.draft) {
			this.props.toaster?.current?.addToast({
				type: ToastType.info,
				message: `Unable register the order 'cause order not approved by ${this.toString(this.props.eatery.name)}. Pls wait or call waiter`,
			});
			return;
		}*/
		this.serverCommand(
			"order/itemsWfNext",
			JSON.stringify({ orderItemIds: items }),
			res => {
				if (!res.ok) return;
				const nState = this.state;
				const items: IOrderItem[] = res.orderItems;
				for (const item of items) {
					const idx = nState.value.items.findIndex(i => i.id === item.id);
					if (idx !== -1) nState.value.items[idx] = item;
				}
				nState.changed = false;
				this.setState(nState);
				if (this.props.onChange) this.props.onChange(this.state.value);
			},
			err => {
				this.props.toaster?.current?.addToast({ type: ToastType.error, message: err.json.message, modal: true });
			}
		);
	}

	renderCompact(): ReactNode {
		const total = calcSum(this.state.value);
		return (
			<div>
				<i className="fa fa-shopping-basket"></i> {this.toCurrency(total.approvedByEaterySum + total.registeredSum + total.fulfilledSum)} {this.toString(this.state.value.items.at(0)?.option.currency)}
				{total.draftCount > 0 ? <span className="badge">{total.draftCount}</span> : <></>}
			</div>
		);
	}
	render(): ReactNode {
		if (this.state.viewMode === ViewModeCode.compact) return this.renderCompact();
		const total = calcSum(this.state.value);
		return (
			<div className="guest-order-container">
				<div className="guest-order-summary">
					<span>
						Order#{this.state.value.id} {this.state.value.created ? new Date(this.state.value.created).toLocaleString() : ""}
					</span>
					<span>
						Balance: {this.toCurrency(total.payed - (total.registeredSum + total.approvedByEaterySum + total.fulfilledSum))}. Payed: {this.toCurrency(total.payed)}. Ordered:{" "}
						{this.toCurrency(total.registeredSum + total.approvedByEaterySum + total.fulfilledSum)}
					</span>
					{
						//<span>of them:</span>
						//<span>Заказано, но не подтверждено {total.registeredSum}</span>
						//<span>Подтверждено, но не доставлено {total.approvedByEaterySum}</span>
						//<span>Доставлено {total.fulfilledSum}</span>
					}
				</div>
				<div className="standalone-toolbar">
					<div>
						<input
							id="checkBoxHideCanceledOrderItem"
							type="checkbox"
							defaultChecked={this.state.hideCanceledOrderItems}
							onChange={event => {
								const nState = this.state;
								nState.hideCanceledOrderItems = !nState.hideCanceledOrderItems;
								this.setState(nState);
							}}
						/>
						Hide canceled
					</div>
					<span
						className="context-menu-button"
						onClick={event => {
							const nState = this.state;
							if (nState.value.id !== undefined)
								this.itemsWfNext(
									nState.value.items
										.filter(item => item.wfStatus === WorkflowStatusCode.draft)
										.map(item => {
											return { id: item.id as Types.ObjectId, nextWfStatus: WorkflowStatusCode.registered };
										})
								);
						}}>
						Register all
					</span>
					<span
						onClick={event => {
							this.serverCommand(
								"user/callWaiter",
								JSON.stringify({ tableId: this.state.value.tableId, on: true }),
								res => {
									if (!res.ok) return;
									const nState = this.state;
									//this.setState(nState);
								},
								err => {}
							);
						}}>
						Call waiter
					</span>
				</div>
				<div className="guest-order-grid">
					<div>WF</div>
					<div>Name</div>
					<div>Price</div>
					<div>Count</div>
					<div>Cost, {this.toString(this.state.value.items?.at(0)?.option.currency)}</div>
					{this.state.value.items
						.sort((a, b) => Number(b.id) - Number(a.id))
						.filter(item => item.wfStatus !== WorkflowStatusCode.canceledByEatery || !this.state.hideCanceledOrderItems)
						.map((item, idx) => (
							<Fragment key={idx}>
								{item.wfHistory !== undefined && item.id !== undefined ? (
									<GuestOrderItemProgress
										wfHistory={item.wfHistory}
										toaster={this.props.toaster}
										orderItemId={item.id}
										onRegister={(itemId: Types.ObjectId) => {
											this.itemWfNext({ id: item.id as Types.ObjectId, nextWfStatus: WorkflowStatusCode.registered });
										}}
									/>
								) : (
									<></>
								)}
								<div key={idx} className={item.wfStatus === WorkflowStatusCode.canceledByEatery ? "canceled" : ""}>
									{this.toString(item.name)}({this.toString(item.option.name)})
								</div>
								<div className={item.wfStatus === WorkflowStatusCode.canceledByEatery ? "canceled" : ""}>{this.toCurrency(item.option.amount)}</div>
								<div className={item.wfStatus === WorkflowStatusCode.canceledByEatery ? "canceled" : "-context-menu"}>
									{item.wfStatus === WorkflowStatusCode.draft ? (
										<span
											className="context-menu-button"
											onClick={event => {
												event.stopPropagation();
												const nState = this.state;
												nState.value.items[idx].count = 0;
												this.updateOrderItem(nState.value.items[idx]);
											}}>
											×
										</span>
									) : (
										<></>
									)}
									{item.wfStatus === WorkflowStatusCode.draft ? (
										<span
											className="context-menu-button"
											onClick={event => {
												event.stopPropagation();
												const nState = this.state;
												if (nState.value.items !== undefined && nState.value.items[idx] !== undefined) {
													nState.value.items[idx].count -= 1;
												}
												this.updateOrderItem(nState.value.items[idx]);
											}}>
											−
										</span>
									) : (
										<></>
									)}
									{item.count}
									{item.wfStatus === WorkflowStatusCode.draft ? (
										<span
											className="context-menu-button"
											onClick={event => {
												event.stopPropagation();
												this.state.value.items[idx].count += 1;
												this.updateOrderItem(this.state.value.items[idx]);
											}}>
											+
										</span>
									) : (
										<></>
									)}
								</div>
								<div className={item.wfStatus === WorkflowStatusCode.canceledByEatery ? "canceled" : ""}>{this.toCurrency(item.count * item.option.amount)}</div>
							</Fragment>
						))}
				</div>
			</div>
		);
	}
}

export interface IGuestOrderItemProgressProps extends IProtoProps {
	orderItemId: Types.ObjectId;
	viewMode?: ViewModeCode;
	wfHistory: IWfHistoryItem[];
	onRegister?: (itemId: Types.ObjectId) => void;
	onReview?: () => void;
}

export interface IGuestOrderItemProgressState extends IProtoState {
	viewMode: ViewModeCode;
}

export class GuestOrderItemProgress extends Proto<IGuestOrderItemProgressProps, IGuestOrderItemProgressState> {
	state: Readonly<IGuestOrderItemProgressState> = {
		viewMode: this.props.viewMode !== undefined ? this.props.viewMode : ViewModeCode.compact,
	};
	renderCompact(): ReactNode {
		const isRegistered = this.props.wfHistory.filter(item => item.wfStatus === WorkflowStatusCode.registered).length === 1;
		const isApproved = this.props.wfHistory.filter(item => item.wfStatus === WorkflowStatusCode.approved).length === 1;
		const isCanceledByEatery = this.props.wfHistory.filter(item => item.wfStatus === WorkflowStatusCode.canceledByEatery).length === 1;
		const isFulfilled = this.props.wfHistory.filter(item => item.wfStatus === WorkflowStatusCode.done).length === 1;
		return (
			<div
				className="guest-order-item-progress-compact-container"
				onClick={event => {
					this.props.toaster?.current?.addToast({ type: ToastType.info, message: JSON.stringify(this.props.wfHistory), modal: false });
				}}>
				<span
					onClick={event => {
						if (!event.currentTarget.classList.contains("done")) {
							event.stopPropagation();
							if (this.props.onRegister !== undefined) this.props.onRegister(this.props.orderItemId);
						}
					}}
					className={isRegistered ? "done" : ""}>
					✎
				</span>
				{isCanceledByEatery ? <span className="canceled">✖</span> : <span className={isApproved ? "done" : ""}>✔</span>}
				<span className={isFulfilled ? "done" : ""}>⚗</span>
				<span>☆</span>
			</div>
		);
	}
	render(): ReactNode {
		if (this.state.viewMode === ViewModeCode.compact) return this.renderCompact();
		return (
			<div className="guest-order-item-progress-container">
				<span>registered</span>
				<span>approved</span>
				<span>fullfilled</span>
				<span>payed</span>
				<span>review</span>
			</div>
		);
	}
}

export function calcSum(order: IOrder): IOrderSumBalance {
	const ret = order.items.reduce<IOrderSumBalance>(
		(prevVal, curItem) => ({
			payed: 0,
			draftCount: curItem.wfStatus === WorkflowStatusCode.draft ? prevVal.draftCount + 1 : prevVal.draftCount,
			draftSum: curItem.wfStatus === WorkflowStatusCode.draft ? prevVal.draftSum + curItem.option.amount * curItem.count : prevVal.draftSum,
			registeredSum: curItem.wfStatus === WorkflowStatusCode.registered ? prevVal.registeredSum + curItem.option.amount * curItem.count : prevVal.registeredSum,
			approvedByEaterySum: curItem.wfStatus === WorkflowStatusCode.approved ? prevVal.approvedByEaterySum + curItem.option.amount * curItem.count : prevVal.approvedByEaterySum,
			fulfilledSum: curItem.wfStatus === WorkflowStatusCode.done || curItem.wfStatus === WorkflowStatusCode.review ? prevVal.fulfilledSum + curItem.option.amount * curItem.count : prevVal.fulfilledSum,
		}),
		{
			payed: 0,
			draftCount: 0,
			draftSum: 0,
			registeredSum: 0,
			approvedByEaterySum: 0,
			fulfilledSum: 0,
		}
	);
	const payed = order.payments.reduce<number>((prvVal, curItem) => prvVal + curItem.amount, 0);
	ret.payed = payed;
	return ret;
}
