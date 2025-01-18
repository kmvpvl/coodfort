import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./order.css";
export interface IOrderProps extends IProtoProps {}
export interface IOrderState extends IProtoState {}

export default class Order extends Proto<IOrderProps, IOrderState> {
	render(): ReactNode {
		return <div className="order-container">Order</div>;
	}
}
