import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import "./eateryOrder.css";
import { IOrder } from "@betypes/ordertypes";
import { Types } from "@betypes/prototypes";
import { calcSum } from "./guestOrder";

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
				console.log(res);
				if (!res.ok) return;
				const nState = this.state;
				nState.value = res.order;
				this.setState(nState);
			},
			err => {
				console.log(err.json);
			}
		);
	}

	protected save() {
		//debugger
		this.serverCommand(
			"order/update",
			JSON.stringify(this.state.value),
			res => {
				console.log(res);
				if (!res.ok) return;
				const nState = this.state;
				nState.value = res.order;
				this.setState(nState);
				if (this.props.onChange && this.state.value !== undefined) this.props.onChange(this.state.value);
			},
			err => {
				console.log(err.json);
			}
		);
	}

	render(): ReactNode {
		if (this.state.value === undefined) return <></>;
		const total = calcSum(this.state.value);
		return (
			<div className="order-eatery-container">
				<div>
					<span>✎</span>
					<span>✔</span>
					<span>$</span>
					<span>☆</span>
				</div>
				<div className="order-eatery-balance">{this.toCurrency(total.payed - (total.registeredSum + total.approvedByEaterySum + total.fulfilledSum))}</div>
				<div>#{this.state.value?.id}</div>
			</div>
		);
	}
}
