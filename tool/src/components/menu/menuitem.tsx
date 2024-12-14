import "./menuitem.css";
import React, { ReactNode, RefObject } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";

import { IMenuItem } from "@betypes/eaterytypes";
import MLStringEditor from "../mlstring/mlstring";

export interface IMenuItemProps extends IProtoProps {
	item: IMenuItem;
	admin?: boolean;
}

export interface IMenuItemState extends IProtoState {
	currentPhotoIndex?: number;
	currentOptionSelected?: number;
	maximized?: boolean;
	editMode?: boolean;
	editedItem: IMenuItem;
}

export default class MenuItem extends Proto<IMenuItemProps, IMenuItemState> {
	private hiddenFileInputRef = React.createRef<HTMLInputElement>();
	state: IMenuItemState = {
		editedItem: this.props.item,
		currentPhotoIndex: this.props.item.photos.length > 0 ? 0 : undefined,
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
					nState.editedItem?.photos.push({
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
			<div className="menu-item-admin-container has-caption">
				<div className="caption">Menu item</div>
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
							navigator.clipboard.writeText(JSON.stringify(this.state.editedItem, undefined, 4));
						}}>
						❏
					</span>
				</div>
				<div className="menu-item-admin-requisites-container has-caption">
					<span className="caption">Requisites</span>
					<input type="text" ref={this.hiddenFileInputRef} id="name" placeholder="enter name" defaultValue={this.state.editedItem?.name}></input>
					<MLStringEditor
						defaultValue={this.state.editedItem?.description}
						caption="Description"
						onChange={newValue => {
							const nState = this.state;
							if (nState.editedItem === undefined) return;

							nState.editedItem.description = newValue;
							this.setState(nState);
						}}
					/>
				</div>
				<div className="menu-item-admin-photos-edit-container has-caption">
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
					<div className="menu-item-admin-photos-list-container">
						{this.state.editedItem?.photos.map((photo, idx) => (
							<span className="menu-item-admin-photo-container" key={idx}>
								<img src={photo.url} />
							</span>
						))}
					</div>
				</div>
				<div className="menu-item-admin-options-list-container has-caption">
					<span className="caption">Options</span>
					<div className="toolbar">
						<span
							onClick={event => {
								const nState = this.state;
								nState.editedItem?.options.push({
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
					<div className="menu-item-admin-options-list">
						{this.state.editedItem?.options.map((option, idx) => (
							<span className="has-caption" key={idx}>
								<MLStringEditor
									defaultValue={option.volume}
									caption="Volume"
									onChange={newValue => {
										const nState = this.state;
										if (nState.editedItem === undefined) return;

										nState.editedItem.options[idx].volume = newValue;
										this.setState(nState);
									}}
								/>
								<input type="number" placeholder="Amount" defaultValue={option.amount}></input>
								<MLStringEditor
									defaultValue={option.currency}
									caption="Currency"
									onChange={newValue => {
										const nState = this.state;
										if (nState.editedItem === undefined) return;

										nState.editedItem.options[idx].currency = newValue;
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
			<span className={`menu-item-container${this.state.maximized ? " maximized" : ""}`}>
				<div className="menu-item-photos-container">
					<div
						className="menu-item-photo-container"
						onClick={event => {
							if (this.props.item.photos.length > 0 && this.state.currentPhotoIndex !== undefined) {
								const nState = this.state;
								nState.currentPhotoIndex = nState.currentPhotoIndex === this.props.item.photos.length - 1 ? 0 : this.state.currentPhotoIndex + 1;
								this.setState(nState);
							}
						}}>
						{this.state.currentPhotoIndex !== undefined ? <img src={this.props.item.photos[this.state.currentPhotoIndex].url}></img> : <></>}
					</div>
					<div className="menu-item-photos-scroll">
						{this.props.item.photos.map((photo, idx) => (
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
				<div className="menu-item-meal-description">
					<span>{this.toString(this.props.item.description)}</span>
				</div>
				<div className="menu-item-meal-options">
					{this.props.item.options.map((option, idx) => (
						<span
							className={`menu-item-meal-option${this.state.currentOptionSelected === idx ? " selected" : ""}`}
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
							<span className="menu-item-meal-option-volume">{this.toString(option.volume)}</span>
							<span className="menu-item-meal-option-price">
								{option.amount} {this.toString(option.currency)}
							</span>
						</span>
					))}
				</div>
				<div className="menu-item-meal-toolbar">
					{this.props.admin ? (
						<span
							onClick={event => {
								const nState = this.state;
								nState.editMode = !this.state.editMode;
								if (nState.editedItem === undefined) nState.editedItem = this.props.item;
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
					<span>☰</span>
				</div>
			</span>
		);
	}
}
