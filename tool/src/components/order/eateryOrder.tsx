import { Fragment, ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import "./eateryOrder.css";
import { IOrder, PaymentMethod } from "@betypes/ordertypes";
import { Types, WorkflowStatusCode } from "@betypes/prototypes";
import { calcSum } from "./guestOrder";
import { ToastType } from "../toast";

export interface IEateryOrderProps extends IProtoProps {
	defaultValue?: IOrder;
	orderId: Types.ObjectId;
	viewMode?: ViewModeCode;
	onChange?: (order: IOrder) => void;
}
export interface IEateryOrderState extends IProtoState {
	viewMode: ViewModeCode;
	value?: IOrder;
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
				this.setState(nState);
			},
			err => {}
		);
	}

	protected save() {
		//debugger
		this.serverCommand(
			"order/update",
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
	render(): ReactNode {
		if (this.state.value === undefined) return <></>;
		const total = calcSum(this.state.value);
		const isApproved = this.state.value.wfHistory?.filter(item => item.wfStatus === WorkflowStatusCode.approved).length === 1;
		const isCanceledByEatery = this.state.value.wfHistory?.filter(item => item.wfStatus === WorkflowStatusCode.canceledByEatery).length === 1;
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
					<span>$</span>
					<span>☆</span>
				</div>
				<div className="order-eatery-balance">{this.toCurrency(total.payed - (total.registeredSum + total.approvedByEaterySum + total.fulfilledSum))}</div>
				<div>#{this.state.value?.id}</div>
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
							{[WorkflowStatusCode.canceledByEatery, WorkflowStatusCode.draft, WorkflowStatusCode.registered, WorkflowStatusCode.approved, WorkflowStatusCode.done, WorkflowStatusCode.review].map((status, indx) => (
								<Fragment key={indx}>
									<div>{WorkflowStatusCode[status]}</div>
									<div className="order-eatery-details-fragment">
										{this.state.value?.items
											.filter(item => item.wfStatus === status)
											.map((item, idx) => (
												<Fragment key={idx}>
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
							))}
						</div>
					</div>
				) : (
					<></>
				)}
			</div>
		);
	}
}
