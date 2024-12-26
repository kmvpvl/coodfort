import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import "./eatery.css";
import { IEatery } from "@betypes/eaterytypes";
import MLStringEditor from "../mlstring/mlstring";
import Tags from "../tags/tags";
import Photos from "../photos/photos";

type EateryFocus = "none" | "profile" | "tables" | "menu" | "entertainments";

export interface IEateryProps extends IProtoProps {
	eatery: IEatery;
	admin?: boolean;
	onSave?: (eatery: IEatery) => void;
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

	save() {
		if (this.state.editedEatery.id !== undefined) {
			this.serverCommand(
				"eatery/update",
				JSON.stringify(this.state.editedEatery),
				res => {
					console.log(res);
					if (!res.ok) return;
					if (this.props.onSave !== undefined) this.props.onSave(res.eatery);
				},
				err => {
					console.log(err);
				}
			);
		}
	}

	renderEditMode(): ReactNode {
		return (
			<div className="eatery-admin-container has-caption">
				<div className="caption">{this.toString(this.props.eatery.name)}</div>
				<div className="toolbar">
					<span>Profile</span>
					<span>Tables</span>
					<span>Menu</span>
					<span>Entertainments</span>
					<span onClick={this.save.bind(this)}>
						<i className="fa fa-save" />
					</span>
					<span
						onClick={event => {
							navigator.clipboard.writeText(JSON.stringify(this.state.editedEatery, undefined, 4));
						}}>
						⚯
					</span>
				</div>
				<div>
					<MLStringEditor
						caption="Name"
						defaultValue={this.state.editedEatery.name}
						onChange={newVal => {
							const nState = this.state;
							nState.editedEatery.name = newVal;
							this.setState(nState);
						}}
					/>
					<MLStringEditor
						caption="Description"
						defaultValue={this.state.editedEatery.description !== undefined ? this.state.editedEatery.description : ""}
						onChange={newVal => {
							const nState = this.state;
							nState.editedEatery.description = newVal;
							this.setState(nState);
						}}
					/>
					<MLStringEditor caption="URL caption" defaultValue={this.state.editedEatery.url !== undefined ? this.state.editedEatery.url.caption : ""} />
					<div className="has-caption">
						<div className="caption">URL</div>
						<input type="text" />
					</div>
					<Photos
						editMode={true}
						defaultValue={this.state.editedEatery.photos !== undefined ? this.state.editedEatery.photos : []}
						onChange={newPhotos => {
							const nState = this.state;
							nState.editedEatery.photos = newPhotos;
							this.setState(nState);
						}}
					/>
					<Tags
						defaultValue={this.state.editedEatery.tags !== undefined ? this.state.editedEatery.tags : []}
						editMode={true}
						onChange={newTags => {
							const nState = this.state;
							nState.editedEatery.tags = newTags;
							this.setState(nState);
						}}
					/>
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
					{this.props.admin ? (
						<span
							onClick={event => {
								const nState = this.state;
								nState.editedEatery = JSON.parse(JSON.stringify(this.props.eatery));
								nState.editMode = true;
								this.setState(nState);
							}}>
							✎
						</span>
					) : (
						<></>
					)}
				</div>
				<span>{this.toString(this.props.eatery.description)}</span>
				<Photos defaultValue={this.props.eatery.photos !== undefined ? this.props.eatery.photos : []} />
			</div>
		);
	}
}
