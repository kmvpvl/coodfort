import "./menuitem.css";
import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";

import { IMenuItem } from "@betypes/eaterytypes";
import MLString from "../../model/mlstring";

export interface IMenuItemProps extends IProtoProps {
	item: IMenuItem;
}

export interface IMenuItemState extends IProtoState {
	currentPhotoIndex?: number;
	currentOptionSelected?: number;
	maximized?: boolean;
}

export default class MenuItem extends Proto<IMenuItemProps, IMenuItemState> {
	state: IMenuItemState = {
		currentPhotoIndex: this.props.item.photos.length > 0 ? 0 : undefined,
	};
	render(): ReactNode {
		return (
			<span
				className={`menu-item-container${this.state.maximized ? " maximized" : ""}`}>
				<div className="menu-item-photos-container">
					<div
						className="menu-item-photo-container"
						onClick={event => {
							if (
								this.props.item.photos.length > 0 &&
								this.state.currentPhotoIndex !== undefined
							) {
								const nState = this.state;
								nState.currentPhotoIndex =
									nState.currentPhotoIndex ===
									this.props.item.photos.length - 1
										? 0
										: this.state.currentPhotoIndex + 1;
								this.setState(nState);
							}
						}}>
						{this.state.currentPhotoIndex !== undefined ? (
							<img
								src={
									this.props.item.photos[
										this.state.currentPhotoIndex
									].url
								}></img>
						) : (
							<></>
						)}
					</div>
					<div className="menu-item-photos-scroll">
						{this.props.item.photos.map((photo, idx) => (
							<span
								data-index={idx}
								key={idx}
								onMouseOver={event => {
									const key =
										event.currentTarget.attributes.getNamedItem(
											"data-index"
										)?.value;
									if (key !== undefined) {
										const i = parseInt(key);
										if (
											i !== this.state.currentPhotoIndex
										) {
											const nState = this.state;
											nState.currentPhotoIndex = i;
											this.setState(nState);
										}
									}
								}}>
								{idx === this.state.currentPhotoIndex
									? `☉`
									: "⚬"}
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
								const optionId =
									event.currentTarget.attributes.getNamedItem(
										"data-option-id"
									)?.value;
								if (optionId !== undefined) {
									const nState = this.state;
									nState.currentOptionSelected =
										parseInt(optionId);
									this.setState(nState);
								}
							}}>
							<span style={{ gridRow: "1 / 3" }}>
								{this.state.currentOptionSelected === idx
									? "☑"
									: "☐"}
							</span>
							<span className="menu-item-meal-option-volume">
								{this.toString(option.volume)}
							</span>
							<span className="menu-item-meal-option-price">
								{option.amount} {this.toString(option.currency)}
							</span>
						</span>
					))}
				</div>
				<div className="menu-item-meal-toolbar">
					<span>❖</span>
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
