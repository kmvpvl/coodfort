import { Fragment, ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import { IOrder, IOrderItem, IOrderSumBalance } from "@betypes/ordertypes";
import "./guestOrder.css";
import { IWfHistoryItem, IWfNextRequest, ObjectTypeCode, Types, WorkflowStatusCode, WorkflowStatusCodeNamesArray } from "@betypes/prototypes";
import { ToastType } from "../toast";
import { IEatery } from "@betypes/eaterytypes";
import Stars from "../feedback/stars";
import { IFeedback } from "@betypes/feedback";
export interface IGuestOrderProps extends IProtoProps {
	defaultValue?: IOrder;
	viewMode?: ViewModeCode;
	orderId?: Types.ObjectId;
	eatery: IEatery;
	eateryId: Types.ObjectId;
	tableId: Types.ObjectId;
	onChange?: (order: IOrder) => void;
	onClick?: (order: IOrder) => void;
}
export interface IGuestOrderState extends IProtoState {
	value: IOrder;
	viewMode: ViewModeCode;
	changed?: boolean;
	hideCanceledOrderItems: boolean;
}

export default class GuestOrder extends Proto<IGuestOrderProps, IGuestOrderState> {
	private pingDescriptor?: NodeJS.Timeout;
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
		this.pingOrder();
	}
	pingOrder() {
		if (this.props.orderId !== undefined || this.state.value.id !== undefined) {
			this.serverCommand(
				"order/view",
				JSON.stringify({ id: this.props.orderId === undefined ? this.state.value.id : this.props.orderId }),
				res => {
					if (!res.ok) return;
					let changed = false;
					const lOrder: IOrder = res.order;
					const nState = this.state;
					if (lOrder.wfStatus !== nState.value.wfStatus) {
						nState.value.wfStatus = lOrder.wfStatus;
						changed = true;
					}
					for (const item of nState.value.items) {
						const tItems = lOrder.items.filter(i => i.id === item.id);
						if (tItems.length === 1 && item.wfStatus !== tItems[0].wfStatus) {
							item.wfStatus = tItems[0].wfStatus;
							item.wfHistory = tItems[0].wfHistory;
							changed = true;
						}
					}
					if (nState.value.payments.length !== lOrder.payments.length) {
						changed = true;
						nState.value.payments = lOrder.payments;
					}
					if (changed) this.setState({ ...nState });
					if (lOrder.wfStatus === WorkflowStatusCode.draft || lOrder.wfStatus === WorkflowStatusCode.approved) this.pingDescriptor = setTimeout(this.pingOrder.bind(this), 5000);
				},
				err => {}
			);
		}
	}
	componentDidUpdate(prevProps: Readonly<IGuestOrderProps>, prevState: Readonly<IGuestOrderState>, snapshot?: any): void {
		if (this.props.defaultValue !== undefined && this.props.defaultValue.id !== this.state.value.id) {
			const nState = this.state;
			nState.value = this.props.defaultValue;
			this.setState(nState);
		}
	}

	private reRenderOrder(order: IOrder) {
		const nState = this.state;
		nState.value = order;
		this.setState(nState);
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
					if (res.ok) this.reRenderOrder(res.order);
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
				<i className="fa fa-shopping-basket"></i> {this.toCurrency(total.approvedByEaterySum + total.registeredSum + total.fulfilledSum)}
				{total.draftCount > 0 ? <span className="badge">{total.draftCount}</span> : <></>}
			</div>
		);
	}
	renderNormal(): ReactNode {
		const total = calcSum(this.state.value);
		return (
			<div
				className="guest-order-normal-container"
				style={this.props.onClick !== undefined ? { cursor: "pointer" } : {}}
				onClick={event => {
					if (this.props.onClick !== undefined) this.props.onClick(this.state.value);
				}}>
				<div className="has-label">
					<div className="label">{this.ML("Table")}</div>
					<div>{this.toString(this.props.eatery.tables.filter(t => t.id === this.state.value.tableId)[0].name)}</div>
				</div>
				<div className="has-label">
					<div className="label">{this.ML("Restaraunt")}</div>
					<div>{this.toString(this.props.eatery.name)}</div>
				</div>
				<div className="has-label">
					<div className="label">{this.ML("Order number")}</div>
					<div>
						<span className="number">#{this.state.value.id}</span> <span className="date">{this.state.value.created !== undefined ? this.relativeDate(this.state.value.created) : ""}</span>
					</div>
				</div>
				<div className="has-label">
					<div className="label">{this.ML("Total")}</div>
					<div className="total">
						{this.toCurrency(total.approvedByEaterySum + total.registeredSum + total.fulfilledSum)} {this.toString(this.state.value.items.at(0)?.option.currency)}
					</div>
				</div>
			</div>
		);
	}
	render(): ReactNode {
		if (this.state.viewMode === ViewModeCode.compact) return this.renderCompact();
		if (this.state.viewMode === ViewModeCode.normal) return this.renderNormal();
		const total = calcSum(this.state.value);
		return (
			<div className="guest-order-container">
				<div className="guest-order-summary">
					<div className="guest-order-summary-order">
						<div className="has-label">
							<div className="label">{this.ML("Order number")}</div>
							<div>
								<span className="number">#{this.state.value.id}</span> <span className="date">{this.state.value.created !== undefined ? this.relativeDate(this.state.value.created) : ""}</span>
							</div>
						</div>
						<div className="has-label" style={{ cursor: "pointer" }}>
							<div className="label">{this.ML("Status")}</div>
							<div>
								<span
									className="number"
									style={this.state.value.wfStatus === WorkflowStatusCode.draft ? { color: "var(--error-color)" } : {}}
									onClick={event => {
										if (this.state.value.wfStatus === WorkflowStatusCode.draft)
											this.props.toaster?.current?.addToast({
												type: ToastType.info,
												message: this.ML("Restaurant staff haven't approve your booking yet"),
											});
									}}>
									{this.state.value.wfStatus !== undefined ? this.ML(WorkflowStatusCodeNamesArray[this.state.value.wfStatus]) : ""}
								</span>
							</div>
						</div>
					</div>
					<div className="guest-order-summary-balance">
						<div className="has-label">
							<div className="label">{this.ML("Total")}</div>
							<div className="total">{this.toCurrency(total.payed - (total.approvedByEaterySum + total.registeredSum + total.fulfilledSum))}</div>
						</div>
						<div className="has-label">
							<div className="label">{this.ML("Paid")}</div>
							<div className="total">{this.toCurrency(total.payed)}</div>
						</div>
						<div className="has-label">
							<div className="label">{this.ML("Ordered")}</div>
							<div className="total">{this.toCurrency(total.approvedByEaterySum + total.registeredSum + total.fulfilledSum)}</div>
						</div>
					</div>
				</div>
				<div className="standalone-toolbar">
					{this.state.value.wfStatus !== WorkflowStatusCode.draft && this.state.value.items.filter(item => item.wfStatus === WorkflowStatusCode.canceledByEatery).length > 0 ? (
						<div>
							<span style={{ display: "flex", alignItems: "center" }}>
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
								{this.ML("Hide cancelled")}
							</span>
						</div>
					) : (
						<></>
					)}
					{this.state.value.wfStatus !== WorkflowStatusCode.draft && total.draftSum > 0 ? (
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
							{this.ML("Send all")}
						</span>
					) : (
						<></>
					)}
				</div>
				<div className="guest-order-grid">
					<div>{this.ML("Status")}</div>
					<div>{this.ML("Meal")}</div>
					<div>{this.ML("Price")}</div>
					<div>{this.ML("Qty.")}</div>
					<div>{this.ML("Cost")}</div>
					{this.state.value.items
						.sort((a, b) => Number(b.id) - Number(a.id))
						.filter(item => item.wfStatus !== WorkflowStatusCode.canceledByEatery || !this.state.hideCanceledOrderItems)
						.map((item, idx) => (
							<Fragment key={idx}>
								{this.state.value.wfStatus !== WorkflowStatusCode.draft && item.wfHistory !== undefined && item.id !== undefined ? (
									<GuestOrderItemProgress
										wfHistory={item.wfHistory}
										toaster={this.props.toaster}
										orderItemId={item.id}
										onRegister={(itemId: Types.ObjectId) => {
											this.itemWfNext({ id: item.id as Types.ObjectId, nextWfStatus: WorkflowStatusCode.registered });
										}}
										onReviewChanged={fb => {
											//if (this.state.value.)
											if (item.wfStatus !== WorkflowStatusCode.done) return;
											this.itemWfNext({ id: item.id as Types.ObjectId, nextWfStatus: WorkflowStatusCode.review });
										}}
									/>
								) : (
									<div></div>
								)}
								<div key={idx} className={item.wfStatus === WorkflowStatusCode.canceledByEatery ? "canceled" : ""}>
									{this.toString(item.name)}({this.toString(item.option.name)})
								</div>
								<div className={item.wfStatus === WorkflowStatusCode.canceledByEatery ? "canceled" : ""}>{this.toCurrency(item.option.amount)}</div>
								<div className={item.wfStatus === WorkflowStatusCode.canceledByEatery ? "canceled" : "context-menu"}>
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
	onReviewChanged?: (feedback: IFeedback) => void;
}

export interface IGuestOrderItemProgressState extends IProtoState {
	viewMode: ViewModeCode;
	feedback: IFeedback;
}

export class GuestOrderItemProgress extends Proto<IGuestOrderItemProgressProps, IGuestOrderItemProgressState> {
	state: Readonly<IGuestOrderItemProgressState> = {
		viewMode: this.props.viewMode !== undefined ? this.props.viewMode : ViewModeCode.compact,
		feedback: {
			objectId: this.props.orderItemId,
			objectType: ObjectTypeCode.orderitem,
			rating: 0,
		},
	};
	saveFeedback() {
		if (this.props.onReviewChanged !== undefined) this.props.onReviewChanged(this.state.feedback);
		this.serverCommand(
			"feedback/update",
			JSON.stringify(this.state.feedback),
			res => {
				if (res.ok) {
					this.setState({ ...this.state, feedback: res.feedback });
				}
			},
			err => {}
		);
	}
	renderCompact(): ReactNode {
		const isRegistered = this.props.wfHistory.filter(item => item.wfStatus === WorkflowStatusCode.registered).length === 1;
		const isApproved = this.props.wfHistory.filter(item => item.wfStatus === WorkflowStatusCode.approved).length === 1;
		const isCanceledByEatery = this.props.wfHistory.filter(item => item.wfStatus === WorkflowStatusCode.canceledByEatery).length === 1;
		const isFulfilled = this.props.wfHistory.filter(item => item.wfStatus === WorkflowStatusCode.done).length === 1;
		const isReviewed = this.props.wfHistory.filter(item => item.wfStatus === WorkflowStatusCode.review).length === 1;
		return (
			<div
				className="guest-order-item-progress-compact-container"
				onClick={event => {
					this.props.toaster?.current?.addToast({
						type: ToastType.info,
						message: (
							<div className="guest-order-history">
								{this.props.wfHistory
									.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
									.map((el, idx) => (
										<Fragment key={idx}>
											<span>{this.ML(WorkflowStatusCodeNamesArray[el.wfStatus])}</span>
											<span>{this.relativeDate(el.created)}</span>
										</Fragment>
									))}
							</div>
						),
						modal: false,
					});
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
				<span
					className={isReviewed ? "done" : ""}
					onClick={event => {
						if (!isFulfilled) return;
						event.preventDefault();
						event.stopPropagation();
						//const ✮
						this.props.toaster?.current?.addToast({
							type: ToastType.info,
							modal: true,
							message: (
								<div className="guest-order-item-feedback-container">
									<div>{this.ML("Leave your feedback here")}</div>
									<Stars
										rating={this.state.feedback.rating}
										onChange={rating => {
											this.setState({ ...this.state, feedback: { ...this.state.feedback, rating: rating } });
										}}
									/>
									<div>
										<textarea
											defaultValue={this.state.feedback.comment}
											onChange={event => {
												const strVal = event.currentTarget.value;
												this.setState({ ...this.state, feedback: { ...this.state.feedback, comment: strVal } });
											}}
										/>
									</div>
								</div>
							),
							buttons: [
								{ text: this.ML("Publish"), default: true, callback: this.saveFeedback.bind(this) },
								{ text: this.ML("Cancel"), callback: () => "" },
							],
						});
					}}>
					☆
				</span>
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
