import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./eatery.css";
import { IEatery } from "@betypes/eaterytypes";
import MLStringEditor from "../mlstring/mlstring";
import Tags from "../tags/tags";
import Photos from "../photos/photos";

type EateryFocus = "none" | "profile" | "tables" | "menu" | "entertainments";

export interface IEateryProps extends IProtoProps {
	defaultValue?: IEatery;
	admin?: boolean;
	onSave?: (eatery: IEatery) => void;
}

export interface IEateryState extends IProtoState {
	value: IEatery;
	editMode: boolean;
	focus?: EateryFocus;
}

export class Eatery extends Proto<IEateryProps, IEateryState> {
	state: IEateryState = {
		value: this.props.defaultValue ? this.props.defaultValue : this.new(),
		editMode: false,
	};

	save() {
		//	if (this.state.value.id !== undefined) {
		this.serverCommand(
			"eatery/update",
			JSON.stringify(this.state.value),
			res => {
				console.log(res);
				if (!res.ok) return;
				if (this.props.onSave !== undefined) this.props.onSave(res.eatery);
			},
			err => {
				console.log(err);
			}
		);
		//	}
	}

	load() {
		if (this.state.value.id === undefined) return;
		this.serverCommand(
			"eatery/view",
			JSON.stringify({ id: this.state.value.id }),
			res => {
				console.log(res);
				if (res.ok) {
					const nState = this.state;
					nState.value = res.eatery;
					this.setState(nState);
				}
			},
			err => {
				console.log(err);
			}
		);
	}

	new(): IEatery {
		const newEatery: IEatery = {
			name: "New Eatery",
			tables: [],
			deliveryPartnerIds: [],
			employees: [],
			entertainmentIds: [],
		};

		return newEatery;
	}

	renderEditMode(): ReactNode {
		return (
			<div className="eatery-admin-container has-caption">
				<div className="caption">{this.toString(this.state.value.name)}</div>
				<div className="toolbar">
					<span onClick={this.save.bind(this)}>
						<i className="fa fa-save" />
					</span>
					<span
						onClick={event => {
							navigator.clipboard.writeText(JSON.stringify(this.state.value, undefined, 4));
						}}>
						⚯
					</span>
					<span
						onClick={event => {
							const nState = this.state;
							nState.editMode = false;
							this.setState(nState);
						}}>
						❖
					</span>
				</div>
				<div className="eatery-admin-data">
					<MLStringEditor
						caption="Name"
						defaultValue={this.state.value.name}
						onChange={newVal => {
							const nState = this.state;
							nState.value.name = newVal;
							this.setState(nState);
						}}
					/>
					<Tags
						defaultValue={this.state.value.tags !== undefined ? this.state.value.tags : []}
						editMode={true}
						onChange={newTags => {
							const nState = this.state;
							nState.value.tags = newTags;
							this.setState(nState);
						}}
					/>
					<MLStringEditor
						className="eatery-admin-description"
						caption="Description"
						defaultValue={this.state.value.description !== undefined ? this.state.value.description : ""}
						onChange={newVal => {
							const nState = this.state;
							nState.value.description = newVal;
							this.setState(nState);
						}}
					/>
					<Photos
						className="eatery-admin-photos"
						editMode={true}
						defaultValue={this.state.value.photos !== undefined ? this.state.value.photos : []}
						onChange={newPhotos => {
							const nState = this.state;
							nState.value.photos = newPhotos;
							this.setState(nState);
						}}
					/>
					<MLStringEditor caption="URL caption" defaultValue={this.state.value.url !== undefined ? this.state.value.url.caption : ""} />
					<div className="has-caption">
						<div className="caption">URL</div>
						<input type="text" />
					</div>
				</div>
			</div>
		);
	}
	render(): ReactNode {
		if (this.state.editMode) return this.renderEditMode();
		return (
			<div className="eatery-container has-context-toolbar">
				<div className="context-toolbar">
					{this.props.admin ? (
						<span
							onClick={event => {
								this.load();
								const nState = this.state;
								nState.editMode = true;
								this.setState(nState);
							}}>
							✎
						</span>
					) : (
						<></>
					)}
				</div>
				<Photos defaultValue={this.state.value.photos} />
				<div className="eatery-name"> {this.toString(this.state.value.name)}</div>
				<span>{this.toString(this.state.value.description)}</span>
			</div>
		);
	}
}
