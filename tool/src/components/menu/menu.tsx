import { ReactNode } from "react";
import "./menu.css";
import Proto, { IProtoProps, IProtoState } from "../proto";
import { IMenu } from "@betypes/eaterytypes";
import MLStringEditor from "../mlstring/mlstring";

export interface IMenuProps extends IProtoProps {
	admin?: boolean;
	editMode?: boolean;
	defaultValue?: IMenu;
	onSave?: (newValue: IMenu) => void;
	onChange?: (newValue: IMenu) => void;
}

export interface IMenuState extends IProtoState {
	value: IMenu;
	editMode?: boolean;
	changed?: boolean;
}

export default class Menu extends Proto<IMenuProps, IMenuState> {
	state: IMenuState = {
		value: this.props.defaultValue !== undefined ? this.props.defaultValue : this.new(),
		editMode: this.props.editMode,
		changed: false,
	};
	new(): IMenu {
		const menu: IMenu = {
			name: "New menu",
			headerHtml: "",
			footerHtml: "",
			chapters: [],
		};
		return menu;
	}
	save() {
		this.serverCommand(
			"menu/update",
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
			<div className="menu-admin-container has-caption">
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
						<i className="fa fa-save" style={this.state.changed ? { color: "red" } : {}} />
					</span>
				</div>
				<div className="caption">
					MENU: {this.state.value.name}-{new Date(this.state.value.changed ? this.state.value.changed : new Date()).toLocaleString()}
				</div>
				<div className="has-caption">
					<div className="caption">Menu name</div>
					<input
						type="text"
						defaultValue={this.state.value.name}
						onChange={event => {
							const nState = this.state;
							nState.value.name = event.currentTarget.value;
							nState.changed = true;
							this.setState(nState);
						}}
					/>
				</div>
				<MLStringEditor
					caption="Menu header"
					className="menu-admin-header"
					defaultValue={this.state.value.headerHtml}
					onChange={newVal => {
						const nState = this.state;
						nState.value.headerHtml = newVal;
						nState.changed = true;
						this.setState(nState);
					}}
				/>
				<div className="has-caption menu-admin-chapters-container">
					<div className="caption">Chapters</div>
					<div className="toolbar">
						<span
							onClick={event => {
								const nState = this.state;
								nState.value.chapters.push({ name: "", description: "", headerHtml: "", footerHtml: "", items: [] });
								this.setState(nState);
							}}>
							+
						</span>
					</div>
					<div>
						{this.state.value.chapters.map((chapter, idx) => (
							<div className="has-caption" key={idx}>
								<div className="caption">CHAPTER</div>
								<div className="toolbar">
									<span>+</span>
								</div>
								<MLStringEditor caption="Chapter name" />
								<MLStringEditor caption="Description" />
								<MLStringEditor caption="Header" />
								<div className="has-caption">
									<div className="caption">Menu items</div>
								</div>
								<MLStringEditor caption="Footer" />
								{this.toString(chapter.name)}
							</div>
						))}
					</div>
				</div>
				<MLStringEditor
					caption="Menu footer"
					defaultValue={this.state.value.footerHtml}
					onChange={newVal => {
						const nState = this.state;
						nState.value.footerHtml = newVal;
						nState.changed = true;
						this.setState(nState);
					}}
				/>
			</div>
		);
	}
	render(): ReactNode {
		if (this.state.editMode) return this.renderEditMode();
		return (
			<div className="menu-container">
				<div dangerouslySetInnerHTML={{ __html: this.toString(this.state.value.headerHtml) }}></div>
				{this.state.value.chapters.map((chapter, idx) => (
					<div>
						<div dangerouslySetInnerHTML={{ __html: this.toString(chapter.headerHtml) }}></div>
						<div dangerouslySetInnerHTML={{ __html: this.toString(chapter.footerHtml) }}></div>
					</div>
				))}
				<div dangerouslySetInnerHTML={{ __html: this.toString(this.state.value.footerHtml) }}></div>
			</div>
		);
	}
}
