import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./eatery.css";
import { IEatery } from "@betypes/eaterytypes";

type EateryFocus = "none" | "profile" | "tables" | "menu" | "entertainments";

export interface IEateryProps extends IProtoProps {
	eatery: IEatery;
	admin?: boolean;
}

export interface IEateryState extends IProtoState {
	editedEatery: IEatery;
	editMode: boolean;
	focus?: EateryFocus;
}

export class Eatery extends Proto<IEateryProps, IEateryState> {
	state: IEateryState = {
		editedEatery: this.props.eatery,
		editMode: false,
	};

	renderEditMode(): ReactNode {
		return (
			<div className="eatery-container">
				<div>
					<span>Profile</span>
					<span>Tables</span>
					<span>Menu</span>
					<span>Entertainments</span>
				</div>
			</div>
		);
	}
	render(): ReactNode {
		if (this.state.editMode) return this.renderEditMode();
		return (
			<div className="eatery-container has-caption">
				<div className="caption"> {this.toString(this.props.eatery.name)}</div>
				<div className="toolbar">
					<span>-</span>
				</div>
			</div>
		);
	}
}
