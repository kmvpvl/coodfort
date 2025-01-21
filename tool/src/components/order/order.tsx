import { Fragment, ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import { IOrder, IOrderItem } from "@betypes/ordertypes";
import "./order.css";
import { Types } from "@betypes/prototypes";
export interface IOrderProps extends IProtoProps {
	defaultValue?: IOrder;
	viewMode?: ViewModeCode;
	orderId?: Types.ObjectId;
	eateryId: Types.ObjectId;
}
export interface IOrderState extends IProtoState {
	value: IOrder;
	viewMode: ViewModeCode;
	changed?: boolean;
}

export default class Order extends Proto<IOrderProps, IOrderState> {
	state: IOrderState = {
		value: this.props.defaultValue !== undefined ? this.props.defaultValue : this.new(),
		viewMode: this.props.viewMode !== undefined ? this.props.viewMode : ViewModeCode.compact,
	};
	get value(): IOrder {
		return this.state.value;
	}
	componentDidMount(): void {
		if (this.props.defaultValue === undefined && this.props.orderId !== undefined) this.load();
	}
	addNewOrderItem(item: IOrderItem) {
		const nState = this.state;
		nState.value.items.push(item);
		this.setState(nState);
		this.save();
	}
	new(): IOrder {
		return {
			eateryId: this.props.eateryId,
			items: [],
			discount: 1,
		};
	}
	protected load() {
		this.serverCommand(
			"order/view",
			JSON.stringify({ id: this.props.orderId }),
			res => {
				console.log(res);
				if (!res.ok) return;
				const nState = this.state;
				nState.changed = false;
				nState.value = res.order;
				this.setState(nState);
			},
			err => {
				console.log(err.json);
			}
		);
	}

	protected save() {
		this.serverCommand(
			"order/update",
			JSON.stringify(this.state.value),
			res => {
				console.log(res);
				if (!res.ok) return;
				const nState = this.state;
				nState.value = res.order;
				nState.changed = false;
				this.setState(nState);
			},
			err => {
				console.log(err.json);
			}
		);
	}
	renderCompact(): ReactNode {
		const sum = this.state.value.items.reduce((prevVal, curItem) => prevVal + curItem.option.amount * curItem.count, 0);
		return (
			<div
				className="order-compact-container"
				onClick={event => {
					if (this.state.value.items.length > 0) this.setState({ ...this.state, viewMode: ViewModeCode.normal });
				}}>
				<div>
					<span className="context-menu-button">
						<i className="fa fa-shopping-basket"></i>
					</span>
					Total: {sum}
				</div>
			</div>
		);
	}
	render(): ReactNode {
		if (this.state.viewMode === ViewModeCode.compact) return this.renderCompact();
		const sum = this.state.value.items.reduce((prevVal, curItem) => prevVal + curItem.option.amount * curItem.count, 0);
		return (
			<div className="order-container">
				<div className="order-grid">
					<div className="context-menu" style={{ gridColumn: "span 5" }}>
						Your order
						<span
							className="context-menu-button"
							onClick={event => {
								const nState = this.state;
								nState.value.items.splice(0, nState.value.items.length);
								this.save();
								nState.viewMode = ViewModeCode.compact;
								this.setState(nState);
							}}>
							⤬
						</span>
						<span className="context-menu-button" onClick={event => this.setState({ ...this.state, viewMode: ViewModeCode.compact })}>
							⚊
						</span>
						<span className="context-menu-button" onClick={event => this.setState({ ...this.state, viewMode: ViewModeCode.compact })}>
							✔
						</span>
					</div>
					<div>#</div>
					<div>Name</div>
					<div>Price</div>
					<div>Count</div>
					<div>Cost, {this.toString(this.state.value.items?.at(0)?.option.currency)}</div>
					{this.state.value.items.map((item, idx) => (
						<Fragment key={idx}>
							<div>{idx + 1}</div>
							<div key={idx}>{this.toString(item.name)}</div>
							<div>{item.option.amount}</div>
							<div className="context-menu">
								<span
									className="context-menu-button"
									onClick={event => {
										event.stopPropagation();
										const nState = this.state;
										nState.value.items.splice(idx, 1);
										this.save();
										this.setState(nState);
									}}>
									⤬
								</span>
								<span
									className="context-menu-button"
									onClick={event => {
										event.stopPropagation();
										const nState = this.state;
										if (nState.value.items !== undefined && nState.value.items[idx] !== undefined) {
											nState.value.items[idx].count -= 1;
											if (nState.value.items[idx].count <= 0) nState.value.items.splice(idx, 1);
										}
										this.save();
										this.setState(nState);
									}}>
									-
								</span>
								{item.count}
								<span
									className="context-menu-button"
									onClick={event => {
										event.stopPropagation();
										const nState = this.state;
										if (nState.value.items !== undefined && nState.value.items[idx] !== undefined) nState.value.items[idx].count += 1;
										this.save();
										this.setState(nState);
									}}>
									+
								</span>
							</div>
							<div>{item.count * item.option.amount}</div>
						</Fragment>
					))}
					<div style={{ gridColumn: "span 4" }}>
						<i className="fa fa-shopping-basket"></i>Total:
					</div>
					<div>{sum}</div>
				</div>
			</div>
		);
	}
}
