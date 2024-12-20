import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import { IEateryBrief } from "@betypes/eaterytypes";
import "./eateryThumb.css";

export interface IEateryThumbProps extends IProtoProps {
	eateryBrief: IEateryBrief;
}

export interface IEateryThumbState extends IProtoState {}

export class EateryThumb extends Proto<IEateryThumbProps, IEateryThumbState> {
	render(): ReactNode {
		return <div>{this.toString(this.props.eateryBrief.name)}</div>;
	}
}
