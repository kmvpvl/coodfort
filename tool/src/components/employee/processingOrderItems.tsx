import { ReactNode } from "react";
import "./processingOrderItems.css";
import { IOrder } from "@betypes/ordertypes";
import React from "react";
import { IWfNextRequest, Types, WorkflowStatusCode } from "@betypes/prototypes";
import "react-data-grid/lib/styles.css";
import DataGrid, { SelectColumn } from "react-data-grid";
import Proto, { IProtoProps, IProtoState } from "../proto";

export interface IProcessingOrderItemsProps extends IProtoProps {
	orders: IOrder[];
	onFulfill: (items: IWfNextRequest[]) => void;
}
export interface IProcessingOrderItemsState extends IProtoState {
	selectedOrderItemsToFulfill?: Set<number>;
}

export default class ProcessingOrderItems extends Proto<IProcessingOrderItemsProps, IProcessingOrderItemsState> {
	state: IProcessingOrderItemsState = {};
	render(): ReactNode {
		const toFulfillRows = [];
		const allRows = [];
		for (const order of this.props.orders) {
			toFulfillRows.push(
				...order.items
					.filter(item => item.wfStatus === WorkflowStatusCode.approved)
					.map(item => {
						return {
							name: this.toString(item.name),
							id: order.id,
							orderItemId: item.id,
							time: Math.round((-new Date(item.changed as unknown as string).getTime() + new Date().getTime()) / 1000 / 60),
							optionName: this.toString(item.option.name),
							count: item.count,
						};
					})
			);
		}
		return (
			<div className="processing-orders-container">
				<div className="standalone-toolbar">
					<span
						onClick={event => {
							if (this.state.selectedOrderItemsToFulfill !== undefined) {
								const items = Array.from(this.state.selectedOrderItemsToFulfill).map<IWfNextRequest>(v => ({ id: v, nextWfStatus: WorkflowStatusCode.done }));
								this.props.onFulfill(items);
							}
						}}>
						Ready
					</span>
				</div>
				<DataGrid
					isRowSelectionDisabled={row => false}
					columns={[
						SelectColumn,
						{ key: "id", name: "Order#" },
						{ key: "orderItemId", name: "OrderItem#" },
						{ key: "name", name: "Meal", resizable: true, width: "20%" },
						{ key: "optionName", name: "Option" },
						{ key: "count", name: "Count" },
						{ key: "time", name: "Min elpsed", sortable: true },
					]}
					rows={toFulfillRows}
					sortColumns={[{ columnKey: "created", direction: "DESC" }]}
					onSelectedRowsChange={cells => {
						console.log(cells);
						this.setState({ ...this.state, selectedOrderItemsToFulfill: cells });
					}}
					rowKeyGetter={row => row.orderItemId as number}
					selectedRows={this.state.selectedOrderItemsToFulfill}
					className="processing-orders-datagrid"
				/>
			</div>
		);
	}
}
