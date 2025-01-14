import { ReactNode } from "react";
import "./menu.css";
import Proto, { IProtoProps, IProtoState } from "../proto";
import { IMenu } from "@betypes/eaterytypes";
import MLStringEditor from "../mlstring/mlstring";
import MenuItem from "./menuitem";

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
				if (this.props.onSave !== undefined) this.props.onSave(res.menu);
				const nState = this.state;
				nState.value = res.menu;
				nState.changed = false;
				this.setState(nState);
			},
			err => {
				console.log(err.json);
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
								nState.value.chapters.push({ headerHtml: "", footerHtml: "", items: [] });
								nState.changed = true;
								this.setState(nState);
							}}>
							+
						</span>
					</div>
					<div>
						{this.state.value.chapters.map((chapter, idx) => (
							<div className="has-caption" key={idx}>
								<div className="caption">CHAPTER</div>
								<MLStringEditor
									caption="Chapter Header"
									defaultValue={this.toString(chapter.headerHtml)}
									onChange={newVal => {
										const nState = this.state;
										nState.changed = true;
										nState.value.chapters[idx].headerHtml = newVal;
										this.setState(nState);
									}}
								/>
								<div className="has-caption menu-admin-meals-container">
									<div className="caption">Menu items</div>
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
											const meal = JSON.parse(event.dataTransfer.getData("coodfort/meal"));
											event.currentTarget.classList.toggle("ready-to-drop", false);
											console.log(meal);
											const nState = this.state;
											nState.value.chapters[idx].items.push({ mealId: meal.id });
											nState.changed = true;
											this.setState(nState);
										}}>
										Drop meals here
									</div>
									{chapter.items.map((item, iidx) => (
										<MenuItem key={iidx} defaultValue={item} />
									))}
								</div>
								<MLStringEditor
									caption="Chapter Footer"
									defaultValue={this.toString(chapter.footerHtml)}
									onChange={newVal => {
										const nState = this.state;
										nState.changed = true;
										nState.value.chapters[idx].footerHtml = newVal;
										this.setState(nState);
									}}
								/>
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
		const menuHeader = this.toString(this.state.value.headerHtml);
		const menuFooter = this.toString(this.state.value.footerHtml);
		return (
			<div className="menu-container">
				{this.isHTML(menuHeader) ? <div dangerouslySetInnerHTML={{ __html: menuHeader }}></div> : <h1>{menuHeader}</h1>}
				{this.state.value.chapters.map((chapter, idx) => (
					<div className="menu-chapter-container" key={idx}>
						{!this.isHTML(this.toString(chapter.headerHtml)) ? <h2 key={idx}>{this.toString(chapter.headerHtml)}</h2> : <div key={idx} dangerouslySetInnerHTML={{ __html: this.toString(chapter.headerHtml) }}></div>}
						<div className="menu-chapter-items-container">
							{chapter.items.map((item, idx) => (
								<MenuItem key={idx} defaultValue={item} />
							))}
						</div>
						<div dangerouslySetInnerHTML={{ __html: this.toString(chapter.footerHtml) }}></div>
					</div>
				))}
				{this.isHTML(menuFooter) ? <div dangerouslySetInnerHTML={{ __html: menuFooter }}></div> : <h1>{menuFooter}</h1>}
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
					<span>⤢</span>
					<span>☷</span>
				</div>
			</div>
		);
	}
}
