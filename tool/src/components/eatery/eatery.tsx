import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./eatery.css";

export interface IEateryProps extends IProtoProps {}

export interface IEateryState extends IProtoState {}

export default class Eatery extends Proto<IEateryProps, IEateryState> {
	render(): ReactNode {
		return (
			<div className="eatery-container">
				<span>Profile</span>
				<span>Tables</span>
				<span>Menu</span>
				<span>Entertainments</span>
			</div>
		);
	}
}
