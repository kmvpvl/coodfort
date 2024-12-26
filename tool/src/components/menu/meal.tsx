import "./meal.css";
import React, { ReactNode, RefObject } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";

import { IMeal } from "@betypes/eaterytypes";
import MLStringEditor from "../mlstring/mlstring";
import Photos from "../photos/photos";

export interface IMealProps extends IProtoProps {
	meal: IMeal;
	admin?: boolean;
	onSave?: (newValue: IMeal) => void;
}

export interface IMealState extends IProtoState {
	currentOptionSelected?: number;
	maximized?: boolean;
	editMode?: boolean;
	editedMeal: IMeal;
}

export default class Meal extends Proto<IMealProps, IMealState> {
	state: IMealState = {
		editedMeal: this.props.meal,
	};

	protected save() {
		if (this.state.editedMeal.id !== undefined) {
			this.serverCommand(
				"meal/update",
				JSON.stringify(this.state.editedMeal),
				res => {
					console.log(res);
					if (!res.ok) return;
					if (this.props.onSave !== undefined) this.props.onSave(res.meal);
				},
				err => {
					console.log(err);
				}
			);
		}
	}

	renderEditMode(): ReactNode {
		return (
			<div className="meal-admin-container has-caption">
				<div className="caption">Meal</div>
				<div className="toolbar">
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
							navigator.clipboard.writeText(JSON.stringify(this.state.editedMeal, undefined, 4));
						}}>
						⚯
					</span>
					<span onClick={this.save.bind(this)}>
						<i className="fa fa-save" />
					</span>
				</div>
				<div className="meal-admin-requisites-container has-caption">
					<span className="caption">Requisites</span>
					<MLStringEditor
						defaultValue={this.state.editedMeal?.name}
						caption="Name"
						onChange={newVal => {
							const nState = this.state;
							nState.editedMeal.name = newVal;
							this.setState(nState);
						}}
					/>
					<MLStringEditor
						defaultValue={this.state.editedMeal?.description}
						caption="Description"
						onChange={newValue => {
							const nState = this.state;
							if (nState.editedMeal === undefined) return;

							nState.editedMeal.description = newValue;
							this.setState(nState);
						}}
					/>
				</div>
				<Photos
					editMode={true}
					defaultValue={this.state.editedMeal.photos}
					onChange={newPhotos => {
						const nState = this.state;
						nState.editedMeal.photos = newPhotos;
						this.setState(nState);
					}}
				/>
				<div className="meal-admin-options-list-container has-caption">
					<span className="caption">Options</span>
					<div className="toolbar">
						<span
							onClick={event => {
								const nState = this.state;
								nState.editedMeal?.options.push({
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
						{this.state.editedMeal?.options.map((option, idx) => (
							<span className="has-caption" key={idx}>
								<MLStringEditor
									defaultValue={option.volume}
									caption="Volume"
									onChange={newValue => {
										const nState = this.state;
										if (nState.editedMeal === undefined) return;

										nState.editedMeal.options[idx].volume = newValue;
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
											nState.editedMeal.options[idx].amount = nv;
											this.setState(nState);
										}
									}}></input>
								<MLStringEditor
									defaultValue={option.currency}
									caption="Currency"
									onChange={newValue => {
										const nState = this.state;
										if (nState.editedMeal === undefined) return;

										nState.editedMeal.options[idx].currency = newValue;
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
				<Photos defaultValue={this.props.meal.photos} />
				<div className="meal-meal-name">
					<span>{this.toString(this.props.meal.name)}</span>
				</div>
				<div className="meal-meal-description">
					<span>{this.toString(this.props.meal.description)}</span>
				</div>
				<div className="meal-meal-options">
					{this.props.meal.options.map((option, idx) => (
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
				<div className="meal-meal-toolbar">
					{this.props.admin ? (
						<span
							onClick={event => {
								const nState = this.state;
								nState.editMode = !this.state.editMode;
								if (nState.editedMeal === undefined) nState.editedMeal = this.props.meal;
								this.setState(nState);
							}}>
							❖
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
						{this.state.maximized ? "⚊" : "❒"}
					</span>
				</div>
			</span>
		);
	}
}
