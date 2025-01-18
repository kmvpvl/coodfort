import { ReactNode } from "react";
import "./menu.css";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import { IMenu } from "@betypes/eaterytypes";
import MLStringEditor from "../mlstring/mlstring";
import MenuItem from "./menuitem";
import { Types } from "@betypes/prototypes";
import Meal from "./meal";

export interface IMenuProps extends IProtoProps {
	admin?: boolean;
	editMode?: boolean;
	defaultValue?: IMenu;
	onSave?: (newValue: IMenu) => void;
	onChange?: (newValue: IMenu) => void;
	viewMode?: ViewModeCode;
	menuId?: Types.ObjectId;
}

export interface IMenuState extends IProtoState {
	value: IMenu;
	editMode?: boolean;
	changed?: boolean;
	viewMode: ViewModeCode;
	currentChapterIndex?: number;
}

export default class Menu extends Proto<IMenuProps, IMenuState> {
	state: IMenuState = {
		value: this.props.defaultValue !== undefined ? this.props.defaultValue : this.new(),
		editMode: this.props.editMode,
		changed: false,
		viewMode: this.props.viewMode !== undefined ? this.props.viewMode : ViewModeCode.normal,
		currentChapterIndex: this.props.defaultValue !== undefined && this.props.defaultValue.chapters.length > 0 ? 0 : undefined,
	};
	componentDidMount(): void {
		if (this.props.defaultValue === undefined && this.props.menuId !== undefined) this.load();
	}

	protected load() {
		this.serverCommand(
			"menu/view",
			JSON.stringify({ id: this.props.menuId }),
			res => {
				console.log(res);
				if (!res.ok) return;
				const nState = this.state;
				nState.changed = false;
				nState.value = res.menu;
				nState.currentChapterIndex = nState.value.chapters.length > 0 ? 0 : undefined;
				this.setState(nState);
			},
			err => {
				console.log(err.json);
			}
		);
	}

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
								nState.value.chapters.push({ name: "", items: [] });
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
									caption="Chapter name"
									defaultValue={this.toString(chapter.name)}
									onChange={newVal => {
										const nState = this.state;
										nState.changed = true;
										nState.value.chapters[idx].name = newVal;
										this.setState(nState);
									}}
								/>
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
											nState.value.chapters[idx].items.push({ mealId: meal.id, options: [] });
											nState.changed = true;
											this.setState(nState);
										}}>
										Drop meals here
									</div>
									{chapter.items.map((item, iidx) => (
										<MenuItem key={iidx} defaultValue={item} admin={true} editMode={true} />
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
	renderCompact(): ReactNode {
		return (
			<div
				className="menu-compact-container"
				draggable={true}
				onDragStart={event => {
					event.dataTransfer.setData("coodfort/menu", JSON.stringify(this.state.value));
				}}>
				MENU: {this.state.value.name}-{new Date(this.state.value.changed ? this.state.value.changed : new Date()).toLocaleString()}
			</div>
		);
	}
	render(): ReactNode {
		if (this.state.editMode) return this.renderEditMode();
		if (this.state.viewMode === ViewModeCode.compact) return this.renderCompact();
		const menuHeader = this.toString(this.state.value.headerHtml);
		const menuFooter = this.toString(this.state.value.footerHtml);
		const curChapter = this.state.currentChapterIndex !== undefined ? this.state.value.chapters[this.state.currentChapterIndex] : undefined;

		return (
			<div className="menu-container">
				<div className="menu-toolbar-container"></div>
				{this.isHTML(menuHeader) ? <div dangerouslySetInnerHTML={{ __html: menuHeader }}></div> : <span>{menuHeader}</span>}
				<div className="menu-chapters-nav">
					{this.state.value.chapters.map((chapter, idx) => (
						<span
							key={idx}
							data-chapter-index={idx}
							className={idx === this.state.currentChapterIndex ? "selected" : ""}
							onClick={event => {
								const nState = this.state;
								const newIndex = event.currentTarget.attributes.getNamedItem("data-chapter-index")?.value;
								if (newIndex === undefined) return;
								nState.currentChapterIndex = parseInt(newIndex);
								this.setState(nState);
							}}>
							{this.toString(chapter.name)}
						</span>
					))}
				</div>
				<div className="menu-chapter-container">
					{curChapter !== undefined ? (
						<>
							{this.isHTML(this.toString(curChapter.headerHtml)) ? <div dangerouslySetInnerHTML={{ __html: this.toString(curChapter.headerHtml) }}></div> : <span>{this.toString(curChapter.headerHtml)}</span>}
							<div className="menu-chapter-items-list">{curChapter?.items.map((menuItem, idx) => <MenuItem key={menuItem.mealId} defaultValue={menuItem} />)}</div>
							{this.isHTML(this.toString(curChapter.footerHtml)) ? <div dangerouslySetInnerHTML={{ __html: this.toString(curChapter.footerHtml) }}></div> : <span>{this.toString(curChapter.footerHtml)}</span>}
						</>
					) : (
						<></>
					)}
				</div>
				{this.isHTML(menuFooter) ? <div dangerouslySetInnerHTML={{ __html: menuFooter }}></div> : <span>{menuFooter}</span>}
				{this.props.admin !== undefined && this.props.admin ? (
					<div className="context-toolbar">
						<span
							onClick={event => {
								const nState = this.state;
								nState.editMode = !this.state.editMode;
								this.setState(nState);
							}}>
							✎
						</span>
						<span>⤢</span>
						<span>
							<i className="fa fa-qrcode"></i>
						</span>
					</div>
				) : (
					<></>
				)}
			</div>
		);
	}
}
