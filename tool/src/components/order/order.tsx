import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import { IOrder } from "@betypes/ordertypes";
import "./order.css";
export interface IOrderProps extends IProtoProps {
	defaultValue?: IOrder;
	viewMode?: ViewModeCode;
}
export interface IOrderState extends IProtoState {
	value: IOrder;
	viewMode: ViewModeCode;
}

export default class Order extends Proto<IOrderProps, IOrderState> {
	state: IOrderState = {
		value: this.props.defaultValue !== undefined ? this.props.defaultValue : this.new(),
		viewMode: this.props.viewMode !== undefined ? this.props.viewMode : ViewModeCode.compact,
	};
	componentDidUpdate(prevProps: Readonly<IOrderProps>, prevState: Readonly<IOrderState>, snapshot?: any): void {
		if (this.props.defaultValue !== undefined) {
			const nState = this.state;
			if (nState.value === this.props.defaultValue) return;
			nState.value = this.props.defaultValue;
			this.setState(nState);
		}
	}
	new(): IOrder {
		return {
			items: [],
			discount: 1,
		};
	}
	renderCompact(): ReactNode {
		const sum = this.state.value.items.reduce((prevVal, curItem) => prevVal + curItem.option.amount * curItem.count, 0);
		return (
			<div className="order-compact-container">
				<div>Total: {sum}</div>
			</div>
		);
	}
	render(): ReactNode {
		if (this.state.viewMode === ViewModeCode.compact) return this.renderCompact();
		return <div className="order-container">Order</div>;
	}
}
