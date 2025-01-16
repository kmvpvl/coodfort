import { ReactNode } from "react";
import "./logo.css";
import React from "react";

export interface ILogoProps {
	onClick?: () => void;
	className?: string;
}
export interface ILogoState {}

export default class Logo extends React.Component<ILogoProps, ILogoState> {
	render(): ReactNode {
		return (
			<div
				className={`logo-container ${this.props.className !== undefined?this.props.className:""}`}
				onClick={event => {
					if (this.props.onClick !== undefined) this.props.onClick();
				}}>
				<div>
					<img src="./exp.svg" />
				</div>
				<div>CoodFort</div>
			</div>
		);
	}
}
