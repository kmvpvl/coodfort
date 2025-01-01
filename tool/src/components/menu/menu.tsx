import { ReactNode } from "react";
import "./menu.css";
import Proto, { IProtoProps, IProtoState } from "../proto";
import { IMenu } from "@betypes/eaterytypes";

export interface IMenuProps extends IProtoProps {
	admin?: boolean;
	defaultValue?: IMenu;
}

export interface IMenuState extends IProtoState {
	editMode?: boolean;
	value: IMenu;
}

export default class Menu extends Proto<IMenuProps, IMenuState> {
	state: IMenuState = {
		editMode: false,
		value: this.props.defaultValue !== undefined?this.props.defaultValue:this.new()
	}
	new(): IMenu {
		const menu: IMenu = {
			headerHtml:"",
			footerHtml:"",
			notesHtml:"",
			chapters:[]
		}
		return menu;
	}
	render(): ReactNode {
		return <div className="menu-container has-caption">
			<div className="caption">MENU</div>
			<div className="toolbar"><span>+</span></div>
			<div dangerouslySetInnerHTML={{__html: this.toString(this.state.value.headerHtml)}}></div>
		</div>
	}
}
