import { ReactNode } from "react";
import "./logo.css";
import React from "react";

export interface ILogoProps {
	onClick?: () => void;
}
export interface ILogoState {}

export default class Logo extends React.Component<ILogoProps, ILogoState> {
	render(): ReactNode {
		return (
			<div
				className="logo-container"
				onClick={event => {
					if (this.props.onClick !== undefined) this.props.onClick();
				}}>
				<div>
					<img src="./logo_new.svg" />
				</div>
				<div>CoodFort</div>
			</div>
		);
	}
}
