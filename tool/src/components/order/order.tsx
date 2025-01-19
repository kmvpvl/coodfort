import { Fragment, ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import { IOrder, IOrderItem } from "@betypes/ordertypes";
import "./order.css";
import { Types } from "@betypes/prototypes";
export interface IOrderProps extends IProtoProps {
	defaultValue?: IOrder;
	viewMode?: ViewModeCode;
	orderId?: Types.ObjectId;
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
	addNewOrderItem(item: IOrderItem) {
		const nState = this.state;
		nState.value.items.push(item);
		this.setState(nState);
		this.save();
	}
	new(): IOrder {
		return {
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
					this.setState({ ...this.state, viewMode: ViewModeCode.normal });
				}}>
				<div>
					<i className="fa fa-shopping-basket"></i>Total: {sum}
				</div>
			</div>
		);
	}
	render(): ReactNode {
		if (this.state.viewMode === ViewModeCode.compact) return this.renderCompact();
		const sum = this.state.value.items.reduce((prevVal, curItem) => prevVal + curItem.option.amount * curItem.count, 0);
		return (
			<div className="order-container">
				<div onClick={event => this.setState({ ...this.state, viewMode: ViewModeCode.compact })} className="order-grid">
					<div style={{ gridColumn: "span 5" }}>Your order</div>
					<div>#</div>
					<div>Name</div>
					<div>Price</div>
					<div>Count</div>
					<div>Cost</div>
					{this.state.value.items.map((item, idx) => (
						<Fragment key={idx}>
							<div>{idx}</div>
							<div key={idx}>{this.toString(item.name)}</div>
							<div>{item.option.amount}</div>
							<div>{item.count}</div>
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
