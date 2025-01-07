import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./menuitem.css";
import { IMeal, IMenuItem } from "@betypes/eaterytypes";
import Meal from "./meal";

export interface IMenuItemProps extends IProtoProps {
	defaultValue?: IMenuItem;
	meal?: IMeal;
	admin?: boolean;
	editMode?: boolean;
}
export interface IMenuItemState extends IProtoState {
	value: IMenuItem;
	editMode: boolean;
}

export default class MenuItem extends Proto<IMenuItemProps, IMenuItemState> {
	state: IMenuItemState = {
		value: this.props.defaultValue !== undefined ? this.props.defaultValue : this.new(this.props.meal),
		editMode: this.props.editMode !== undefined ? this.props.editMode : false,
	};
	new(meal?: IMeal): IMenuItem {
		if (meal !== undefined) {
			return { mealId: meal.id };
		}
		return {};
	}
	render(): ReactNode {
		return (
			<div className="menu-item-container">
				<Meal defaultValue={this.props.meal} mealId={this.state.value.mealId} />
			</div>
		);
	}
}
