import { ReactNode } from "react";
import "./menu.css";
import Proto, { IProtoProps, IProtoState, ViewModeCode } from "../proto";
import { IMenu } from "@betypes/eaterytypes";
import MLStringEditor from "../mlstring/mlstring";
import MenuItem from "./menuitem";
import { Types } from "@betypes/prototypes";
import { IOrderItem } from "@betypes/ordertypes";
import { ToastType } from "../toast";

enum AdminFocusCode {
	All = "All",
	Attributes = "Attributes",
	Chapters = "Chapters",
}

export interface IMenuProps extends IProtoProps {
	admin?: boolean;
	editMode?: boolean;
	defaultValue?: IMenu;
	onSave?: (newValue: IMenu) => void;
	onChange?: (newValue: IMenu) => void;
	onSelectMenuItem?: (item: IOrderItem) => void;
	viewMode?: ViewModeCode;
	menuId?: Types.ObjectId;
	onClick?: (menuId?: Types.ObjectId) => void;
}

export interface IMenuState extends IProtoState {
	value: IMenu;
	editMode?: boolean;
	changed?: boolean;
	viewMode: ViewModeCode;
	currentChapterIndex?: number;
	currentMenuItemIndex?: number;
	adminFocus?: AdminFocusCode;
}

export default class Menu extends Proto<IMenuProps, IMenuState> {
	state: IMenuState = {
		value: this.props.defaultValue !== undefined ? this.props.defaultValue : this.new(),
		editMode: this.props.editMode,
		changed: false,
		viewMode: this.props.viewMode !== undefined ? this.props.viewMode : ViewModeCode.normal,
		currentChapterIndex: this.props.defaultValue !== undefined && this.props.defaultValue.chapters.length > 0 ? 0 : undefined,
		adminFocus: AdminFocusCode.All,
	};
	componentDidMount(): void {
		if (this.props.defaultValue === undefined && this.props.menuId !== undefined) this.load();
	}

	protected load() {
		this.serverCommand(
			"menu/view",
			JSON.stringify({ id: this.props.menuId }),
			res => {
				if (!res.ok) return;
				const nState = this.state;
				nState.changed = false;
				nState.value = res.menu;
				nState.currentChapterIndex = nState.value.chapters.length > 0 ? 0 : undefined;
				this.setState(nState);
			},
			err => {}
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
				if (!res.ok) return;
				if (this.props.onSave !== undefined) this.props.onSave(res.menu);
				const nState = this.state;
				nState.value = res.menu;
				nState.changed = false;
				this.setState(nState);
			},
			err => {}
		);
	}
	renderEditMode(): ReactNode {
		const curChapter = this.state.currentChapterIndex !== undefined ? this.state.value.chapters.at(this.state.currentChapterIndex) : undefined;
		if (curChapter !== undefined && this.state.currentMenuItemIndex === undefined && curChapter.items.length > 0) {
			//this.state.currentMenuItemIndex = 0;
		}
		return (
			<div className="menu-admin-container" style={this.state.adminFocus !== AdminFocusCode.All ? { gridTemplateRows: "" } : {}}>
				<div className="menu-admin-view-focus-list">
					{Object.keys(AdminFocusCode).map((key, idx) => (
						<span
							className={this.state.adminFocus === key ? "selected" : ""}
							key={idx}
							onClick={event => {
								this.setState({ ...this.state, adminFocus: Object.values(AdminFocusCode)[idx] });
							}}>
							{key}
						</span>
					))}
				</div>
				<div className="standalone-toolbar">
					<span onClick={this.save.bind(this)}>
						<i className="fa fa-save" style={this.state.changed ? { color: "red" } : {}} />
					</span>
					<span>✖</span>
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
				</div>
				{this.state.adminFocus === AdminFocusCode.Attributes || this.state.adminFocus === AdminFocusCode.All ? (
					<>
						<div>
							MENU: {this.state.value.name}-{new Date(this.state.value.changed ? this.state.value.changed : new Date()).toLocaleString()}
						</div>
						<div>
							<span>Menu name</span>
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
							key={`menuHeaderHtml${this.state.value.id}`}
						/>
						<MLStringEditor
							caption="Menu footer"
							defaultValue={this.state.value.footerHtml}
							onChange={newVal => {
								const nState = this.state;
								nState.value.footerHtml = newVal;
								nState.changed = true;
								this.setState(nState);
							}}
							key={`menuFooterHtml${this.state.value.id}`}
						/>
					</>
				) : (
					<></>
				)}
				{this.state.adminFocus === AdminFocusCode.Chapters || this.state.adminFocus === AdminFocusCode.All ? (
					<>
						<div className="menu-admin-chapters-container has-caption">
							<div className="toolbar">
								<span
									onClick={event => {
										// add new chapter
										const nState = this.state;
										nState.value.chapters.push({ name: "New chapter", items: [] });
										nState.changed = true;
										this.setState(nState);
									}}>
									+
								</span>
								{this.state.currentChapterIndex !== undefined && this.state.currentChapterIndex > 0 ? (
									<span
										onClick={event => {
											//up current chapter
											if (this.state.currentChapterIndex === undefined) return;
											this.state.value.chapters.splice(this.state.currentChapterIndex - 1, 0, ...this.state.value.chapters.splice(this.state.currentChapterIndex, 1));
											this.setState({ ...this.state, currentChapterIndex: this.state.currentChapterIndex - 1, changed: true });
										}}>
										↑
									</span>
								) : (
									<></>
								)}
								{this.state.currentChapterIndex !== undefined && this.state.currentChapterIndex < this.state.value.chapters.length - 1 ? (
									<span
										onClick={event => {
											//down current chapter
											if (this.state.currentChapterIndex === undefined) return;
											this.state.value.chapters.splice(this.state.currentChapterIndex + 1, 0, ...this.state.value.chapters.splice(this.state.currentChapterIndex, 1));
											this.setState({ ...this.state, currentChapterIndex: this.state.currentChapterIndex + 1, changed: true });
										}}>
										↓
									</span>
								) : (
									<></>
								)}
								<span
									onClick={event => {
										// delete current chapter
										if (this.state.currentChapterIndex !== undefined) {
											this.props.toaster?.current?.addToast({
												type: ToastType.info,
												modal: true,
												message: `Are you sure to delete current chapter ${this.toString(this.state.value.chapters[this.state.currentChapterIndex].name)}`,
												buttons: [
													{
														text: "Yes",
														callback: (() => {
															const nState = this.state;
															if (this.state.currentChapterIndex !== undefined) {
																nState.value.chapters.splice(this.state.currentChapterIndex, 1);
																if (nState.value.chapters.length > 0) nState.currentChapterIndex = 0;
																else nState.currentChapterIndex = undefined;
																nState.changed = true;
																this.setState(nState);
															}
														}).bind(this),
													},
													{ text: "No", callback: () => {} },
												],
											});
										}
									}}>
									<span style={{ transform: "rotate(45deg)", display: "block" }}>+</span>
								</span>
							</div>
							<div className="caption">Select chapter for editing</div>
							<div className="menu-admin-chapters-nav">
								{this.state.value.chapters.map((chapter, idx) => (
									<span
										key={idx}
										className={this.state.currentChapterIndex === idx ? "selected" : ""}
										onClick={event => {
											const nState = this.state;
											nState.currentChapterIndex = idx;
											nState.currentMenuItemIndex = undefined;
											this.setState(nState);
										}}>
										{this.toString(chapter.name)}
									</span>
								))}
							</div>
						</div>
						<MLStringEditor
							caption="Chapter name"
							defaultValue={curChapter?.name}
							key={`menuChapterName${this.state.currentChapterIndex}`}
							onChange={newVal => {
								const nState = this.state;
								if (this.state.currentChapterIndex !== undefined) nState.value.chapters[this.state.currentChapterIndex].name = newVal;
								nState.changed = true;
								this.setState(nState);
							}}
						/>
						<MLStringEditor
							caption="Chapter header"
							defaultValue={curChapter?.headerHtml}
							key={`menuChapterHeader${this.state.currentChapterIndex}`}
							onChange={newVal => {
								const nState = this.state;
								if (this.state.currentChapterIndex !== undefined) nState.value.chapters[this.state.currentChapterIndex].headerHtml = newVal;
								nState.changed = true;
								this.setState(nState);
							}}
						/>
						<MLStringEditor
							caption="Chapter footer"
							defaultValue={curChapter?.footerHtml}
							key={`menuChapterFooter${this.state.currentChapterIndex}`}
							onChange={newVal => {
								const nState = this.state;
								if (this.state.currentChapterIndex !== undefined) nState.value.chapters[this.state.currentChapterIndex].footerHtml = newVal;
								nState.changed = true;
								this.setState(nState);
							}}
						/>
						<div
							className="drop-zone"
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
								curChapter?.items.push({ mealId: meal.id, options: [] });
								nState.changed = true;
								this.setState(nState);
							}}>
							Drop meals here
						</div>
						<div className="menu-admin-meals-container has-caption">
							<div className="caption">Select menu item for editing</div>
							<div className="toolbar">
								{this.state.currentMenuItemIndex !== undefined && this.state.currentMenuItemIndex > 0 ? (
									<span
										onClick={event => {
											//up current menu item
											if (this.state.currentMenuItemIndex === undefined || this.state.currentChapterIndex === undefined) return;
											this.state.value.chapters[this.state.currentChapterIndex].items.splice(
												this.state.currentMenuItemIndex - 1,
												0,
												...this.state.value.chapters[this.state.currentChapterIndex].items.splice(this.state.currentMenuItemIndex, 1)
											);
											this.setState({ ...this.state, currentMenuItemIndex: this.state.currentMenuItemIndex - 1, changed: true });
										}}>
										↑
									</span>
								) : (
									<></>
								)}
								{this.state.currentMenuItemIndex !== undefined && this.state.currentChapterIndex !== undefined && this.state.currentMenuItemIndex < this.state.value.chapters[this.state.currentChapterIndex].items.length - 1 ? (
									<span
										onClick={event => {
											//up current menu item
											if (this.state.currentMenuItemIndex === undefined || this.state.currentChapterIndex === undefined) return;
											this.state.value.chapters[this.state.currentChapterIndex].items.splice(
												this.state.currentMenuItemIndex + 1,
												0,
												...this.state.value.chapters[this.state.currentChapterIndex].items.splice(this.state.currentMenuItemIndex, 1)
											);
											this.setState({ ...this.state, currentMenuItemIndex: this.state.currentMenuItemIndex + 1, changed: true });
										}}>
										↓
									</span>
								) : (
									<></>
								)}
								{this.state.currentMenuItemIndex !== undefined ? (
									<span
										onClick={event => {
											// delete current menu item
											if (this.state.currentMenuItemIndex !== undefined) {
												this.props.toaster?.current?.addToast({
													type: ToastType.info,
													modal: true,
													message: `Are you sure to delete current menu item?`,
													buttons: [
														{
															text: "Yes",
															callback: (() => {
																const nState = this.state;
																if (this.state.currentMenuItemIndex !== undefined && this.state.currentChapterIndex !== undefined) {
																	nState.value.chapters[this.state.currentChapterIndex].items.splice(this.state.currentMenuItemIndex, 1);
																	if (nState.value.chapters[this.state.currentChapterIndex].items.length > 0) nState.currentMenuItemIndex = 0;
																	else nState.currentMenuItemIndex = undefined;
																	nState.changed = true;
																	this.setState(nState);
																}
															}).bind(this),
														},
														{ text: "No", callback: () => {} },
													],
												});
											}
										}}>
										<span style={{ transform: "rotate(45deg)", display: "block" }}>+</span>
									</span>
								) : (
									<></>
								)}
							</div>

							<div className="menu-admin-meals-nav">
								{curChapter?.items.map((item, idx) => (
									<span
										className={this.state.currentMenuItemIndex === idx ? "selected" : ""}
										key={`${item.mealId}_${idx}`}
										onClick={event => {
											this.setState({ ...this.state, currentMenuItemIndex: idx });
										}}>
										<MenuItem
											defaultValue={item}
											admin={true}
											//editMode={true}
											viewMode={ViewModeCode.compact}
											onChange={newVal => {
												const nState = this.state;
												curChapter.items[idx] = newVal;
												nState.changed = true;
												this.setState(nState);
											}}
										/>
									</span>
								))}
							</div>
						</div>
						{this.state.currentMenuItemIndex !== undefined && this.state.currentMenuItemIndex >= 0 ? (
							<div style={{ overflow: "auto", gridColumn: "span 2" }}>
								<MenuItem
									key={this.state.currentMenuItemIndex}
									defaultValue={curChapter?.items[this.state.currentMenuItemIndex]}
									admin={true}
									editMode={true}
									viewMode={ViewModeCode.normal}
									onChange={newVal => {
										if (this.state.currentMenuItemIndex === undefined || curChapter === undefined) return;
										const nState = this.state;
										curChapter.items[this.state.currentMenuItemIndex] = newVal;
										nState.changed = true;
										this.setState(nState);
									}}
								/>
							</div>
						) : (
							<></>
						)}
					</>
				) : (
					<></>
				)}
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
				}}
				onClick={event => {
					if (this.props.onClick !== undefined) this.props.onClick(this.state.value.id);
				}}
				style={this.props.onClick !== undefined ? { cursor: "pointer" } : {}}>
				<div>{this.state.value.name}</div>
				<div>{new Date(this.state.value.changed ? this.state.value.changed : new Date()).toLocaleDateString()}</div>
				<div>{new Date(this.state.value.changed ? this.state.value.changed : new Date()).toLocaleTimeString()}</div>
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
							className={`button ${idx === this.state.currentChapterIndex ? "selected" : ""}`}
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
							<div className="menu-chapter-items-list">
								{curChapter?.items.map((menuItem, idx) => (
									<MenuItem
										key={menuItem.mealId}
										defaultValue={menuItem}
										onSelectOption={(meal, option) => {
											if (this.props.onSelectMenuItem !== undefined) {
												this.props.onSelectMenuItem({ name: meal.name, description: meal.description, option: option, count: 1 });
											}
										}}
									/>
								))}
							</div>
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
						{
							//<span>⤢</span>
						}
						{
							//<span><i className="fa fa-qrcode"></i></span>
						}
					</div>
				) : (
					<></>
				)}
			</div>
		);
	}
}
