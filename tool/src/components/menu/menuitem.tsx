import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./menuitem.css";
import Meal, { IMealProps, IMealState } from "./meal";
import { Types } from "@betypes/prototypes";
import { IMeal, IMealOption, IMenuItem } from "@betypes/eaterytypes";
import MLStringEditor from "../mlstring/mlstring";
import React from "react";

export interface IMenuItemProps extends IProtoProps {
	defaultValue?: IMenuItem;
	admin?: boolean;
	maximized?: boolean;
	editMode?: boolean;
	onSave?: (newValue: IMenuItem) => void;
	onChange?: (newValue: IMenuItem) => void;
	onSelectOption?: (meal: IMeal, option: IMealOption) => void;
}
export interface IMenuItemState extends IProtoState {
	value: IMenuItem;
	maximized?: boolean;
	editMode?: boolean;
	changed?: boolean;
	currentOptionSelected?: number;
}

export default class MenuItem extends Proto<IMenuItemProps, IMenuItemState> {
	protected mealRef: React.RefObject<Meal | null> = React.createRef();
	state: IMenuItemState = {
		value: this.props.defaultValue !== undefined ? this.props.defaultValue : this.new(),
		editMode: this.props.editMode,
	};
	new(): IMenuItem {
		return {
			options: [],
		};
	}
	renderEditMode(): ReactNode {
		return (
			<span className="menu-item-admin-container">
				<Meal mealId={this.state.value.mealId} />
				<div className="menu-item-admin-options-list-container has-caption">
					<span className="caption">Options</span>
					<div className="toolbar">
						<span
							onClick={event => {
								const nState = this.state;
								if (nState.value.options === undefined) nState.value.options = [];
								nState.value.options.push({
									name: "",
									amount: 0,
									currency: "",
								});
								this.setState(nState);
							}}>
							+
						</span>
						<span>?</span>
					</div>
					<div className="menu-item-admin-options-list">
						{this.state.value?.options?.map((option, idx) => (
							<span className="has-caption" key={idx}>
								<MLStringEditor
									defaultValue={option.name}
									caption="Option name"
									onChange={newValue => {
										const nState = this.state;
										if (nState.value === undefined) return;
										nState.changed = true;
										nState.value.options[idx].name = newValue;
										this.setState(nState);
									}}
								/>
								<input
									type="number"
									placeholder="Amount"
									defaultValue={option.amount}
									onChange={event => {
										const nv = parseFloat(event.currentTarget.value);
										if (!isNaN(nv)) {
											const nState = this.state;
											nState.changed = true;
											nState.value.options[idx].amount = nv;
											this.setState(nState);
										}
									}}></input>
								<MLStringEditor
									defaultValue={option.currency}
									caption="Currency"
									onChange={newValue => {
										const nState = this.state;
										if (nState.value === undefined) return;
										nState.changed = true;
										nState.value.options[idx].currency = newValue;
										this.setState(nState);
									}}
								/>
							</span>
						))}
					</div>
				</div>
			</span>
		);
	}
	render(): ReactNode {
		if (this.state.editMode) return this.renderEditMode();
		return (
			<span className={`menu-item-container${this.state.maximized ? " maximized" : ""}`}>
				<Meal mealId={this.state.value.mealId} ref={this.mealRef} />
				<div className="menu-item-options">
					{this.state.value.options?.map((option, idx) => (
						<span
							className={`menu-item-option${this.state.currentOptionSelected === idx ? " selected" : ""}`}
							key={idx}
							data-option-id={idx}
							onClick={event => {
								const optionId = event.currentTarget.attributes.getNamedItem("data-option-id")?.value;
								if (optionId !== undefined) {
									const nState = this.state;
									nState.currentOptionSelected = parseInt(optionId);
									this.setState(nState);
									if (this.props.onSelectOption && this.mealRef.current) this.props.onSelectOption(this.mealRef.current.value, this.state.value.options[parseInt(optionId)]);
								}
							}}>
							<span style={{ gridRow: "1 / 3" }}>{this.state.currentOptionSelected === idx ? "☑" : "☐"}</span>
							<span className="menu-item-option-volume">{this.toString(option.name)}</span>
							<span className="menu-item-option-price">
								{option.amount} {this.toString(option.currency)}
							</span>
						</span>
					))}
				</div>
			</span>
		);
	}
}
