import { ReactNode } from "react";
import "./approveOrderItems.css";
import { IOrder } from "@betypes/ordertypes";
import React from "react";
import { IWfNextRequest, Types, WorkflowStatusCode } from "@betypes/prototypes";
import "react-data-grid/lib/styles.css";
import DataGrid, { SelectColumn } from "react-data-grid";
import Proto, { IProtoProps, IProtoState } from "../proto";

export interface IApproveOrderItemsProps extends IProtoProps {
	orders: IOrder[];
	onApprove: (items: IWfNextRequest[]) => void;
	onCancel: (items: IWfNextRequest[]) => void;
}
export interface IApproveOrderItemsState extends IProtoState {
	selectedOrderItemsToApprove?: Set<number>;
}

export default class ApproveOrderItems extends Proto<IApproveOrderItemsProps, IApproveOrderItemsState> {
	state: IApproveOrderItemsState = {};
	render(): ReactNode {
		const toApproveRows = [];
		const allRows = [];
		for (const order of this.props.orders) {
			toApproveRows.push(
				...order.items
					.filter(item => item.wfStatus === WorkflowStatusCode.registered)
					.map(item => {
						return {
							name: this.toString(item.name),
							id: order.id,
							orderItemId: item.id,
							time: Math.round((-new Date(item.changed as unknown as string).getTime() + new Date().getTime()) / 1000 / 60),
							stage: item.wfStatus,
							optionName: this.toString(item.option.name),
							count: item.count,
						};
					})
			);
		}
		return (
			<div className="approve-orders-container">
				<div className="standalone-toolbar">
					<span
						onClick={event => {
							if (this.state.selectedOrderItemsToApprove !== undefined) {
								const items = Array.from(this.state.selectedOrderItemsToApprove).map<IWfNextRequest>(v => ({ id: v, nextWfStatus: WorkflowStatusCode.approved }));
								this.props.onApprove(items);
							}
							//this.setState({ ...this.state, selectedOrderItemsToApprove: undefined });
						}}>
						Approve
					</span>
					<span
						onClick={event => {
							if (this.state.selectedOrderItemsToApprove !== undefined) {
								const items = Array.from(this.state.selectedOrderItemsToApprove).map<IWfNextRequest>(v => ({ id: v, nextWfStatus: WorkflowStatusCode.canceledByEatery }));
								this.props.onCancel(items);
							}
							//this.setState({ ...this.state, selectedOrderItemsToApprove: undefined });
						}}>
						Reject
					</span>
				</div>
				<DataGrid
					isRowSelectionDisabled={row => false}
					columns={[
						SelectColumn,
						{ key: "id", name: "Order#" },
						{ key: "orderItemId", name: "OrderItem#" },
						//{ key: "stage", name: "Stage" },
						{ key: "name", name: "Meal", resizable: true, width: "20%" },
						{ key: "optionName", name: "Option" },
						{ key: "count", name: "Count" },
						{ key: "time", name: "Minutes elps", sortable: true },
					]}
					rows={toApproveRows}
					sortColumns={[{ columnKey: "time", direction: "DESC" }]}
					onSelectedRowsChange={cells => {
						console.log(cells);
						this.setState({ ...this.state, selectedOrderItemsToApprove: cells });
					}}
					rowKeyGetter={row => row.orderItemId as number}
					selectedRows={this.state.selectedOrderItemsToApprove}
					className="approve-orders-datagrid"
				/>
			</div>
		);
	}
}
