import { IUser } from "@betypes/prototypes";
import "./user.css";
import React, { ReactNode } from "react";

export interface IUserProps {
	defaultValue: IUser;
}

export interface IUserState {
	value?: IUser;
}

export default class User extends React.Component<IUserProps, IUserState> {
	state = {
		value: this.props.defaultValue,
	};
	render(): ReactNode {
		return (
			<span className="user-container">
				{this.state.value?.photo?.url !== undefined ? (
					<span className="circle-img-container">
						<img src={this.state.value?.photo?.url} />
					</span>
				) : (
					<></>
				)}
				<span>{this.state.value?.name}</span>
			</span>
		);
	}
}
