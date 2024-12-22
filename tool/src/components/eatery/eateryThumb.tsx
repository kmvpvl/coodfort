import { MouseEventHandler, ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import { IEateryBrief } from "@betypes/eaterytypes";
import "./eateryThumb.css";

export interface IEateryThumbProps extends IProtoProps {
	eateryBrief: IEateryBrief;
	onSelect?: (eatery: IEateryBrief)=>void;
}

export interface IEateryThumbState extends IProtoState {}

export class EateryThumb extends Proto<IEateryThumbProps, IEateryThumbState> {
	onSelect: MouseEventHandler<HTMLDivElement> = (event) => {
		if (this.props.onSelect !== undefined) this.props.onSelect(this.props.eateryBrief);
	}
	render(): ReactNode {
		return <div onClick={this.onSelect.bind(this)}>{this.toString(this.props.eateryBrief.name)}</div>;
	}
}
