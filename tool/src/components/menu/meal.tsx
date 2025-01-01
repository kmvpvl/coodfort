import "./meal.css";
import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";

import { IMeal } from "@betypes/eaterytypes";
import MLStringEditor from "../mlstring/mlstring";
import Photos from "../photos/photos";
import Tags from "../tags/tags";

export interface IMealProps extends IProtoProps {
	defaultValue?: IMeal;
	admin?: boolean;
	onSave?: (newValue: IMeal) => void;
	onChange?: (newValue: IMeal) => void;
}

export interface IMealState extends IProtoState {
	currentOptionSelected?: number;
	maximized?: boolean;
	editMode?: boolean;
	value: IMeal;
	changed?: boolean;
}

export default class Meal extends Proto<IMealProps, IMealState> {
	state: IMealState = {
		value: this.props.defaultValue ? this.props.defaultValue : this.new(),
	};

	new(): IMeal {
		const newMeal: IMeal = {
			name: "New meal",
			description: "Mew meal description. Add photo!",
			photos: [],
			options: [],
		};
		return newMeal;
	}

	protected save() {
		this.serverCommand(
			"meal/update",
			JSON.stringify(this.state.value),
			res => {
				console.log(res);
				if (!res.ok) return;
				if (this.props.onSave !== undefined) this.props.onSave(res.meal);
				const nState = this.state;
				nState.changed = false;
				this.setState(nState);
			},
			err => {
				console.log(err);
			}
		);
	}

	renderEditMode(): ReactNode {
		return (
			<div className="meal-admin-container has-caption">
				<div className="caption">MEAL: {this.toString(this.state.value.name)}</div>
				<div className="toolbar">
					<span>⤬</span>
					<span
						onClick={event => {
							const nState = this.state;
							nState.editMode = false;
							this.setState(nState);
						}}>
						❖
					</span>
					<span
						onClick={event => {
							navigator.clipboard.writeText(JSON.stringify(this.state.value, undefined, 4));
						}}>
						⚯
					</span>
					<span onClick={this.save.bind(this)}>
						<i className="fa fa-save" style={this.state.changed?{color:"red"}:{}}/>
					</span>
				</div>
				<div className="meal-admin-requisites-container has-caption">
					<span className="caption">Requisites</span>
					<MLStringEditor
						defaultValue={this.state.value?.name}
						caption="Name"
						onChange={newVal => {
							const nState = this.state;
							nState.changed = true;
							nState.value.name = newVal;
							this.setState(nState);
						}}
					/>
					<Tags
						defaultValue={this.state.value.tags}
						editMode={true}
						onChange={newTags => {
							const nState = this.state;
							nState.changed = true;
							nState.value.tags = newTags;
							this.setState(nState);
						}}
					/>
					<MLStringEditor
						className="meal-admin-requisites-description"
						defaultValue={this.state.value?.description}
						caption="Description"
						onChange={newValue => {
							const nState = this.state;
							nState.value.description = newValue;
							nState.changed = true;
							this.setState(nState);
						}}
					/>
				</div>
				<Photos
					editMode={true}
					defaultValue={this.state.value.photos}
					onChange={newPhotos => {
						const nState = this.state;
						nState.value.photos = newPhotos;
						nState.changed = true;
						this.setState(nState);
					}}
				/>
				<div className="meal-admin-options-list-container has-caption">
					<span className="caption">Options</span>
					<div className="toolbar">
						<span
							onClick={event => {
								const nState = this.state;
								nState.value?.options.push({
									volume: "",
									amount: 0,
									currency: "",
								});
								this.setState(nState);
							}}>
							+
						</span>
						<span>?</span>
					</div>
					<div className="meal-admin-options-list">
						{this.state.value?.options.map((option, idx) => (
							<span className="has-caption" key={idx}>
								<MLStringEditor
									defaultValue={option.volume}
									caption="Volume"
									onChange={newValue => {
										const nState = this.state;
										if (nState.value === undefined) return;
										nState.changed = true;
										nState.value.options[idx].volume = newValue;
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
			</div>
		);
	}

	render(): ReactNode {
		if (this.state.editMode) return this.renderEditMode();
		return (
			<span className={`meal-container${this.state.maximized ? " maximized" : ""}`}>
				<Photos defaultValue={this.props.defaultValue?.photos} />
				<div className="meal-meal-name">
					<span>{this.toString(this.state.value.name)}</span>
				</div>
				<div className="meal-meal-description">{this.toString(this.state.value.description)}</div>
				<div className="meal-meal-options">
					{this.state.value.options.map((option, idx) => (
						<span
							className={`meal-meal-option${this.state.currentOptionSelected === idx ? " selected" : ""}`}
							key={idx}
							data-option-id={idx}
							onClick={event => {
								const optionId = event.currentTarget.attributes.getNamedItem("data-option-id")?.value;
								if (optionId !== undefined) {
									const nState = this.state;
									nState.currentOptionSelected = parseInt(optionId);
									this.setState(nState);
								}
							}}>
							<span style={{ gridRow: "1 / 3" }}>{this.state.currentOptionSelected === idx ? "☑" : "☐"}</span>
							<span className="meal-meal-option-volume">{this.toString(option.volume)}</span>
							<span className="meal-meal-option-price">
								{option.amount} {this.toString(option.currency)}
							</span>
						</span>
					))}
				</div>
				<div className="context-toolbar">
					{this.props.admin ? (
						<span
							onClick={event => {
								const nState = this.state;
								nState.editMode = !this.state.editMode;
								this.setState(nState);
							}}>
							✎
						</span>
					) : (
						<></>
					)}
					<span
						onClick={event => {
							const nState = this.state;
							nState.maximized = !this.state.maximized;
							this.setState(nState);
						}}>
						{this.state.maximized ? "⚊" : "⤢"}
					</span>
					<span>☷</span>
				</div>
			</span>
		);
	}
}
