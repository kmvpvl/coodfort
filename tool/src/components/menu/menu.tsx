import { ReactNode } from "react";
import "./menu.css";
import Proto, { IProtoProps, IProtoState } from "../proto";
import { IMenu } from "@betypes/eaterytypes";
import MLStringEditor from "../mlstring/mlstring";

export interface IMenuProps extends IProtoProps {
	editMode?: boolean;
	defaultValue?: IMenu;
}

export interface IMenuState extends IProtoState {
	value: IMenu;
}

export default class Menu extends Proto<IMenuProps, IMenuState> {
	state: IMenuState = {
		value: this.props.defaultValue !== undefined ? this.props.defaultValue : this.new(),
	};
	new(): IMenu {
		const menu: IMenu = {
			headerHtml: "",
			footerHtml: "",
			chapters: [],
		};
		return menu;
	}
	renderEditMode(): ReactNode {
		return (
			<div className="menu-admin-container has-caption">
				<div className="caption">MENU</div>
				<MLStringEditor caption="Menu header" className="menu-admin-header" />
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
				<MLStringEditor caption="Menu footer" />
			</div>
		);
	}
	render(): ReactNode {
		if (this.props.editMode) return this.renderEditMode();
		return (
			<div className="menu-container">
				<div dangerouslySetInnerHTML={{ __html: this.toString(this.state.value.headerHtml) }}></div>
			</div>
		);
	}
}
