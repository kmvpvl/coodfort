import { Fragment, ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import "./eateryOrder.css";
import { IOrder, PaymentMethod } from "@betypes/ordertypes";
import { ObjectTypeCode, Types, WorkflowStatusCode } from "@betypes/prototypes";
import { calcSum } from "./guestOrder";
import { ToastType } from "../toast";
import { IFeedback } from "@betypes/feedback";
import Stars from "../feedback/stars";

export interface IEateryOrderProps extends IProtoProps {
	defaultValue?: IOrder;
	orderId: Types.ObjectId;
	viewMode?: ViewModeCode;
	onChange?: (order: IOrder) => void;
}
export interface IEateryOrderState extends IProtoState {
	viewMode: ViewModeCode;
	value?: IOrder;
	guestFeedback?: IFeedback;
}

export default class EateryOrder extends Proto<IEateryOrderProps, IEateryOrderState> {
	state: IEateryOrderState = {
		viewMode: this.props.viewMode !== undefined ? this.props.viewMode : ViewModeCode.compact,
		value: this.props.defaultValue !== undefined ? this.props.defaultValue : undefined,
	};
	componentDidMount(): void {
		this.load();
	}
	public load() {
		this.serverCommand(
			"order/view",
			JSON.stringify({ id: this.props.orderId === undefined ? this.state.value?.id : this.props.orderId }),
			res => {
				if (!res.ok) return;
				const nState = this.state;
				nState.value = res.order;
				(nState.guestFeedback =
					nState.value?.userId !== undefined
						? {
								objectType: ObjectTypeCode.guest,
								rating: 0,
								objectId: nState.value?.userId,
							}
						: undefined),
					this.setState(nState);
			},
			err => {}
		);
	}

	protected save() {
		this.serverCommand(
			"order/new",
			JSON.stringify(this.state.value),
			res => {
				if (!res.ok) return;
				const nState = this.state;
				nState.value = res.order;
				this.setState(nState);
				if (this.props.onChange && this.state.value !== undefined) this.props.onChange(this.state.value);
			},
			err => {}
		);
	}

	cancelOrderByEatery() {
		this.serverCommand(
			"order/wfNext",
			JSON.stringify({ id: this.state.value?.id, nextWfStatus: WorkflowStatusCode.canceledByEatery }),
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

	approveOrder() {
		this.serverCommand(
			"order/wfNext",
			JSON.stringify({ id: this.state.value?.id, nextWfStatus: WorkflowStatusCode.approved }),
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
	doneOrder() {
		this.serverCommand(
			"order/wfNext",
			JSON.stringify({ id: this.state.value?.id, nextWfStatus: WorkflowStatusCode.done }),
			res => {
				if (res.ok) {
					const nState = this.state;
					nState.value = res.order;
					this.setState(nState);
					this.props.toaster?.current?.addToast({
						type: ToastType.info,
						message: "Order's closed successfully. Leave feedback about the guest",
					});
				}
			},
			err => {
				this.props.toaster?.current?.addToast({
					type: ToastType.error,
					message: "You couldn't close the order 'cause you have approved and not fulfilled items",
				});
			}
		);
	}
	saveFeedback() {
		if (this.state.guestFeedback === undefined) return;
		this.serverCommand(
			"feedback/update",
			JSON.stringify(this.state.guestFeedback),
			res => {
				if (res.ok) {
					this.setState({ ...this.state, guestFeedback: res.feedback });
					this.serverCommand(
						"order/wfNext",
						JSON.stringify({ id: this.state.value?.id, nextWfStatus: WorkflowStatusCode.review }),
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
			},
			err => {}
		);
	}
	close() {
		if (this.state.guestFeedback === undefined) return;
		this.serverCommand(
			"order/wfNext",
			JSON.stringify({ id: this.state.value?.id, nextWfStatus: WorkflowStatusCode.closed }),
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
	render(): ReactNode {
		if (this.state.value === undefined) return <></>;
		const total = calcSum(this.state.value);
		const isApproved = this.state.value.wfHistory?.filter(item => item.wfStatus === WorkflowStatusCode.approved).length === 1;
		const isCanceledByEatery = this.state.value.wfHistory?.filter(item => item.wfStatus === WorkflowStatusCode.canceledByEatery).length === 1;
		const isDone = this.state.value.wfHistory?.filter(item => item.wfStatus === WorkflowStatusCode.done).length === 1;
		const isReview = this.state.value.wfHistory?.filter(item => item.wfStatus === WorkflowStatusCode.review).length === 1;
		return (
			<div className="order-eatery-container">
				<div className="context-toolbar">
					<span
						onClick={event => {
							this.setState({ ...this.state, viewMode: this.state.viewMode === ViewModeCode.compact ? ViewModeCode.maximized : ViewModeCode.compact });
						}}>
						{this.state.viewMode === ViewModeCode.maximized ? "⚊" : "⤢"}
					</span>
					{this.state.viewMode === ViewModeCode.maximized ? (
						<span
							onClick={event => {
								this.props.toaster?.current?.addToast({
									type: ToastType.info,
									modal: true,
									message: <span>Are you sure?</span>,
									buttons: [{ text: "OK", callback: this.cancelOrderByEatery.bind(this) }],
								});
							}}>
							✖
						</span>
					) : (
						<></>
					)}
				</div>
				<div className="order-status-container">
					{isCanceledByEatery ? (
						<span className="canceled">✖</span>
					) : (
						<span className={isApproved ? "done" : ""} onClick={this.approveOrder.bind(this)}>
							✔
						</span>
					)}
					<span className={isDone ? "done" : ""} onClick={this.doneOrder.bind(this)}>
						$
					</span>
					<span
						className={isReview ? "done" : ""}
						onClick={event => {
							this.props.toaster?.current?.addToast({
								type: ToastType.info,
								modal: true,
								message: (
									<div className="guest-order-item-feedback-container">
										<div>Leave your feedback here</div>
										<Stars
											rating={this.state.guestFeedback?.rating}
											onChange={rating => {
												if (this.state.guestFeedback === undefined) return;
												this.setState({ ...this.state, guestFeedback: { ...this.state.guestFeedback, rating: rating } });
											}}
										/>
										<div>
											<textarea
												defaultValue={this.state.guestFeedback?.comment}
												onChange={event => {
													const strVal = event.currentTarget.value;
													if (this.state.guestFeedback === undefined) return;
													this.setState({ ...this.state, guestFeedback: { ...this.state.guestFeedback, comment: strVal } });
												}}
											/>
										</div>
									</div>
								),
								buttons: [
									{ text: "Publish", default: true, callback: this.saveFeedback.bind(this) },
									{ text: "Cancel", callback: () => "" },
								],
							});
						}}>
						☆
					</span>
					{isDone || isReview ? <span onClick={this.close.bind(this)}>Close</span> : <></>}
				</div>
				<div className="order-eatery-balance">{this.toCurrency(total.payed - (total.registeredSum + total.approvedByEaterySum + total.fulfilledSum))}</div>
				<div className="order-eatery-number">
					<span>#{this.state.value?.id}</span>
					{this.state.value.created !== undefined ? <span>{this.relativeDate(this.state.value.created)}</span> : <></>}
				</div>
				{this.state.viewMode === ViewModeCode.maximized ? (
					<div className="order-eatery-details">
						<div className="order-eatery-payments-list">
							{this.state.value.payments.map((payment, idx) => (
								<span key={idx}>
									Payment #{idx + 1}: {this.toCurrency(payment.amount)}
								</span>
							))}
							<span>
								Payment #{this.state.value.payments.length + 1}
								<input id="payment-amount" contentEditable={true} type="number" />
								<select id="payment-method">
									{Object.values(PaymentMethod)
										.filter(item => !isNaN(Number(item)))
										.map((method, idx) => (
											<option key={idx} value={Number(method)}>
												{PaymentMethod[Number(method)]}
											</option>
										))}
								</select>
								<button
									onClick={event => {
										const payment_str = (document.getElementById("payment-amount") as HTMLInputElement).value;
										if (payment_str && payment_str !== undefined) {
											const payment = parseFloat(payment_str);
											if (!isNaN(payment)) {
												this.serverCommand(
													"payment/new",
													JSON.stringify({
														order_id: this.state.value?.id,
														paymentMethod: Number((document.getElementById("payment-method") as HTMLSelectElement).value),
														amount: payment,
													}),
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
										}
									}}>
									Get
								</button>
							</span>
						</div>
						<div>
							{[WorkflowStatusCode.canceledByEatery, WorkflowStatusCode.draft, WorkflowStatusCode.registered, WorkflowStatusCode.approved, WorkflowStatusCode.done, WorkflowStatusCode.review].map((status, indx) =>
								this.state.value !== undefined && this.state.value.items.filter(item => item.wfStatus === status).length > 0 ? (
									<Fragment key={`${this.state.value.id}_${status}`}>
										<div className="order-eatery-details-chapter">
											➛ {WorkflowStatusCode[status]} {this.toCurrency(this.state.value.items.filter(item => item.wfStatus === status).reduce<number>((prev, item) => prev + item.count * item.option.amount, 0))}
										</div>
										<div className="order-eatery-details-fragment">
											{this.state.value?.items
												.filter(item => item.wfStatus === status)
												.map((item, idx) => (
													<Fragment key={`${item.order_id}_${item.id}`}>
														<span>{idx + 1}</span>
														<span>
															{this.toString(item.name)} ({this.toString(item.option.name)})
														</span>
														<span>
															{item.count} * {this.toCurrency(item.option.amount)} = {this.toCurrency(item.option.amount * item.count)}
														</span>
													</Fragment>
												))}
										</div>
									</Fragment>
								) : (
									<Fragment key={indx}></Fragment>
								)
							)}
						</div>
					</div>
				) : (
					<></>
				)}
			</div>
		);
	}
}
