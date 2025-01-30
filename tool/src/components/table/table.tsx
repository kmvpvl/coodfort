import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import "./table.css";
import { ITable } from "@betypes/eaterytypes";
import EateryOrder from "../order/eateryOrder";
import { IOrder } from "@betypes/ordertypes";

export interface ITableProps extends IProtoProps {
	defaultValue?: ITable;
	viewMode?: ViewModeCode;
	orders?: IOrder[];
}
export interface ITableState extends IProtoState {
	value: ITable;
	callingWaiter: boolean;
	viewMode: ViewModeCode;
}

export default class Table extends Proto<ITableProps, ITableState> {
	state: ITableState = {
		viewMode: this.props.viewMode !== undefined ? this.props.viewMode : ViewModeCode.normal,
		value: this.props.defaultValue !== undefined ? this.props.defaultValue : this.new(),
		callingWaiter: false,
	};
	componentDidMount(): void {
		this.load();
		//setInterval(this.load.bind(this), 10000);
	}
	new(): ITable {
		return {
			name: "New table",
			tags: [],
		};
	}
	public load() {
		this.serverCommand(
			"eatery/tableCallWaiterSignals",
			JSON.stringify({ tableIds: [this.state.value.id] }),
			res => {
				if (!res.ok) return;
				const nState = this.state;
				if (res.tableCallWaiterSignals.length === 1 && res.tableCallWaiterSignals[0].on) {
					nState.callingWaiter = true;
				} else {
					nState.callingWaiter = false;
				}
				this.setState(nState);
			},
			err => {}
		);
	}

	protected off() {
		this.serverCommand(
			"user/callWaiter",
			JSON.stringify({ tableId: this.state.value.id, on: false }),
			res => {
				if (!res.ok) return;
				const nState = this.state;
				nState.callingWaiter = res.tableCallWaiterSignal.on;
				this.setState(nState);
			},
			err => {}
		);
	}

	render(): ReactNode {
		return (
			<div className="table-container">
				<span>{this.toString(this.state.value.name)}</span>
				<span>{this.props.orders?.map((order, idx) => (order.id !== undefined ? <EateryOrder key={order.id} orderId={order.id} /> : <></>))}</span>
				{this.state.callingWaiter ? <span onClick={this.off.bind(this)}>☉</span> : <span></span>}
			</div>
		);
	}
}
