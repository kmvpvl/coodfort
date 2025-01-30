import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import "./eatery.css";
import { IEatery } from "@betypes/eaterytypes";
import MLStringEditor from "../mlstring/mlstring";
import Tags from "../tags/tags";
import Photos from "../photos/photos";
import Menu from "../menu/menu";
import React from "react";

type EateryFocus = "none" | "profile" | "tables" | "menu" | "entertainments";

export interface IEateryProps extends IProtoProps {
	defaultValue?: IEatery;
	admin?: boolean;
	editMode?: boolean;
	onSave?: (eatery: IEatery) => void;
	viewMode?: ViewModeCode;
	className?: string;
	onClick?: (eatery: IEatery) => void;
}

export interface IEateryState extends IProtoState {
	value: IEatery;
	editMode: boolean;
	focus?: EateryFocus;
	changed?: boolean;
	viewMode: ViewModeCode;
}

export class Eatery extends Proto<IEateryProps, IEateryState> {
	photosRef: React.RefObject<Photos | null> = React.createRef();
	state: IEateryState = {
		value: this.props.defaultValue ? this.props.defaultValue : this.new(),
		editMode: this.props.editMode !== undefined ? this.props.editMode : false,
		changed: false,
		viewMode: this.props.viewMode === undefined ? ViewModeCode.normal : this.props.viewMode,
	};

	save() {
		//	if (this.state.value.id !== undefined) {
		this.serverCommand(
			"eatery/update",
			JSON.stringify(this.state.value),
			res => {
				if (!res.ok) return;
				if (this.props.onSave !== undefined) this.props.onSave(res.eatery);
				const nState = this.state;
				nState.changed = false;
				nState.value = res.eatery;
				this.setState(nState);
			},
			err => {}
		);
		//	}
	}

	load() {
		if (this.state.value.id === undefined) return;
		this.serverCommand(
			"eatery/view",
			JSON.stringify({ id: this.state.value.id }),
			res => {
				if (res.ok) {
					const nState = this.state;
					nState.value = res.eatery;
					nState.changed = false;
					this.setState(nState);
				}
			},
			err => {}
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
			<div
				className="eatery-admin-container"
				onKeyUp={event => {
					console.log(event);
				}}>
				<div className="standalone-toolbar">
					EATERY: {this.toString(this.state.value.name)}
					<span onClick={this.save.bind(this)}>
						<i className="fa fa-save" style={this.state.changed ? { color: "red" } : {}} />
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
							nState.changed = true;
							this.setState(nState);
						}}
					/>
					<Tags
						defaultValue={this.state.value.tags !== undefined ? this.state.value.tags : []}
						editMode={true}
						onChange={newTags => {
							const nState = this.state;
							nState.value.tags = newTags;
							nState.changed = true;
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
							nState.changed = true;
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
							nState.changed = true;
							this.setState(nState);
						}}
					/>
					<MLStringEditor
						caption="URL caption"
						defaultValue={this.state.value.url !== undefined ? this.state.value.url.caption : ""}
						onChange={newVal => {
							const nState = this.state;
							if (nState.value.url !== undefined) nState.value.url.caption = newVal;
							else nState.value.url = { caption: newVal, url: "" };
							nState.changed = true;
							this.setState(nState);
						}}
					/>
					<div className="has-caption">
						<div className="caption">URL</div>
						<input
							defaultValue={this.state.value.url?.url}
							type="text"
							onChange={event => {
								const nState = this.state;
								if (nState.value.url !== undefined) nState.value.url.url = event.currentTarget.value;
								else nState.value.url = { caption: "", url: event.currentTarget.value };
								nState.changed = true;
								this.setState(nState);
							}}
						/>
					</div>
					<div className="has-caption eatery-admin-tables-container">
						<div className="caption">Tables</div>
						<div className="toolbar">
							<span
								onClick={event => {
									const nState = this.state;
									nState.value.tables.push({ name: "New table", tags: [] });
									nState.changed = true;
									this.setState(nState);
								}}>
								+
							</span>
						</div>
						{this.state.value.tables?.map((table, idx) => (
							<div className="has-caption eatery-admin-table-container" key={idx}>
								<div className="caption">TABLE: {this.toString(table.name)}</div>
								<MLStringEditor
									defaultValue={table.name}
									caption="Name"
									onChange={newVal => {
										const nState = this.state;
										nState.value.tables[idx].name = newVal;
										nState.changed = true;
										this.setState(nState);
									}}
								/>
								<Tags
									defaultValue={this.state.value.tables[idx].tags}
									editMode={true}
									onChange={newVal => {
										const nState = this.state;
										nState.value.tables[idx].tags = newVal;
										nState.changed = true;
										this.setState(nState);
									}}
								/>
								<Photos
									defaultValue={this.state.value.tables[idx].photos}
									editMode={true}
									className="eatery-admin-table-photos"
									onChange={newVal => {
										const nState = this.state;
										nState.value.tables[idx].photos = newVal;
										nState.changed = true;
										this.setState(nState);
									}}
								/>
								<div className="has-caption">
									<div className="caption">Min guests</div>
									<input
										defaultValue={this.state.value.tables[idx].guestCountMin}
										type="number"
										onChange={event => {
											const nState = this.state;
											nState.value.tables[idx].guestCountMin = parseInt(event.currentTarget.value);
											nState.changed = true;
											this.setState(nState);
										}}
									/>
								</div>
								<div className="has-caption">
									<div className="caption">Max guests</div>
									<input
										type="number"
										defaultValue={this.state.value.tables[idx].guestCountMax}
										onChange={event => {
											const nState = this.state;
											nState.value.tables[idx].guestCountMax = parseInt(event.currentTarget.value);
											nState.changed = true;
											this.setState(nState);
										}}
									/>
								</div>
							</div>
						))}
					</div>
					<div
						onDragEnter={event => {
							event.preventDefault();
							event.currentTarget.classList.toggle("ready-to-drop", true);
							event.dataTransfer.dropEffect = "link";
						}}
						onDragOver={event => {
							event.preventDefault();
							event.dataTransfer.dropEffect = "link";
						}}
						onDragLeave={event => {
							console.log("leave");
							event.preventDefault();
							event.currentTarget.classList.toggle("ready-to-drop", false);
						}}
						onDragEnd={event => {
							console.log("end");
							event.preventDefault();
							event.currentTarget.classList.toggle("ready-to-drop", false);
						}}
						onDrop={event => {
							event.preventDefault();
							const menu = JSON.parse(event.dataTransfer.getData("coodfort/menu"));
							event.currentTarget.classList.toggle("ready-to-drop", false);
							console.log(menu);
							const nState = this.state;
							nState.value.menuId = menu.id;
							nState.changed = true;
							this.setState(nState);
						}}>
						Drop actual menu here
					</div>
					{this.state.value.menuId !== undefined ? <Menu viewMode={ViewModeCode.compact} menuId={this.state.value.menuId} /> : <></>}
				</div>
			</div>
		);
	}
	renderCompact(): ReactNode {
		return (
			<div className={`eatery-compact-container ${this.props.className !== undefined ? this.props.className : ""}`} onClick={event => this.props.onClick?.call(this, this.state.value)}>
				<Photos className="eatery-compact-photos" defaultValue={this.state.value.photos} />
				<div>{this.toString(this.state.value.name)}</div>
			</div>
		);
	}
	render(): ReactNode {
		if (this.state.editMode) return this.renderEditMode();
		if (this.state.viewMode === ViewModeCode.compact) return this.renderCompact();
		return (
			<div className={`eatery-container has-context-toolbar${this.state.viewMode === ViewModeCode.maximized ? " maximized" : ""}`}>
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
					{this.state.viewMode === ViewModeCode.maximized || this.state.viewMode === ViewModeCode.normal ? (
						<span
							onClick={event => {
								const nState = this.state;
								nState.viewMode = this.state.viewMode === ViewModeCode.maximized ? ViewModeCode.normal : ViewModeCode.maximized;
								this.setState(nState);
							}}>
							{this.state.viewMode === ViewModeCode.maximized ? "⚊" : "⤢"}
						</span>
					) : (
						<></>
					)}
					<span
						onClick={event => {
							this.photosRef.current?.qr(`${process.env.QR_BASE_URL}?startapp=eateryId_${this.state.value.id}__tableId_${this.state.value.tables.at(0)?.id}`);
						}}>
						<i className="fa fa-qrcode"></i>
					</span>
				</div>
				<Photos ref={this.photosRef} defaultValue={this.state.value.photos} />
				<div className="eatery-name"> {this.toString(this.state.value.name)}</div>
				<span className="eatery-description">{this.toString(this.state.value.description)}</span>
			</div>
		);
	}
}
