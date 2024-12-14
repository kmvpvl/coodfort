import "./meal.css";
import React, { ReactNode, RefObject } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";

import { IMeal } from "@betypes/eaterytypes";
import MLStringEditor from "../mlstring/mlstring";

export interface IMealProps extends IProtoProps {
	meal: IMeal;
	admin?: boolean;
}

export interface IMealState extends IProtoState {
	currentPhotoIndex?: number;
	currentOptionSelected?: number;
	maximized?: boolean;
	editMode?: boolean;
	editedMeal: IMeal;
}

export default class Meal extends Proto<IMealProps, IMealState> {
	private hiddenFileInputRef = React.createRef<HTMLInputElement>();
	state: IMealState = {
		editedMeal: this.props.meal,
		currentPhotoIndex: this.props.meal.photos.length > 0 ? 0 : undefined,
	};

	protected editModeLoadImages(files: FileList) {
		for (let i = 0; i < files.length; i++) {
			const file = files[i];

			if (!file.type.startsWith("image/")) {
				continue;
			}
			const reader = new FileReader();
			reader.onload = () => {
				const src = reader.result;
				if (src) {
					const nState = this.state;
					nState.editedMeal?.photos.push({
						url: src.toString(),
						caption: "",
					});
					this.setState(nState);
				}
			};
			reader.readAsDataURL(file);
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
						❏
					</span>
				</div>
				<div className="meal-admin-requisites-container has-caption">
					<span className="caption">Requisites</span>
					<input type="text" ref={this.hiddenFileInputRef} id="name" placeholder="enter name" defaultValue={this.state.editedMeal?.name}></input>
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
				<div className="meal-admin-photos-edit-container has-caption">
					<span className="caption">Photos</span>
					<div className="toolbar">
						<label>
							+
							<input
								type="file"
								id="inputImages"
								hidden
								multiple
								accept="image/*"
								onChange={event => {
									const files = event.currentTarget.files;
									if (files) this.editModeLoadImages(files);
									event.currentTarget.value = "";
								}}></input>
						</label>{" "}
						or{" "}
						<span
							onDragEnter={event => {
								event.stopPropagation();
								event.preventDefault();
							}}
							onDragOver={event => {
								event.stopPropagation();
								event.preventDefault();
							}}
							onDrop={event => {
								event.stopPropagation();
								event.preventDefault();

								const dt = event.dataTransfer;
								const files = dt.files;
								this.editModeLoadImages(files);
							}}>
							drop files here
						</span>
					</div>
					<div className="meal-admin-photos-list-container">
						{this.state.editedMeal?.photos.map((photo, idx) => (
							<span className="meal-admin-photo-container" key={idx}>
								<img src={photo.url} />
							</span>
						))}
					</div>
				</div>
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
								<input type="number" placeholder="Amount" defaultValue={option.amount}></input>
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
				<div className="meal-photos-container">
					<div
						className="meal-photo-container"
						onClick={event => {
							if (this.props.meal.photos.length > 0 && this.state.currentPhotoIndex !== undefined) {
								const nState = this.state;
								nState.currentPhotoIndex = nState.currentPhotoIndex === this.props.meal.photos.length - 1 ? 0 : this.state.currentPhotoIndex + 1;
								this.setState(nState);
							}
						}}>
						{this.state.currentPhotoIndex !== undefined ? <img src={this.props.meal.photos[this.state.currentPhotoIndex].url}></img> : <></>}
					</div>
					<div className="meal-photos-scroll">
						{this.props.meal.photos.map((photo, idx) => (
							<span
								data-index={idx}
								key={idx}
								onMouseOver={event => {
									const key = event.currentTarget.attributes.getNamedItem("data-index")?.value;
									if (key !== undefined) {
										const i = parseInt(key);
										if (i !== this.state.currentPhotoIndex) {
											const nState = this.state;
											nState.currentPhotoIndex = i;
											this.setState(nState);
										}
									}
								}}>
								{idx === this.state.currentPhotoIndex ? `☉` : "⚬"}
							</span>
						))}
					</div>
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
