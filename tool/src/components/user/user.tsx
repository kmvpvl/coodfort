import { IUser } from "@betypes/prototypes";
import "./user.css";
import React, { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";
import { ToastType } from "../toast";

export interface IUserProps extends IProtoProps {
	defaultValue: IUser;
}

export interface IUserState extends IProtoState {
	value?: IUser;
}

export default class User extends Proto<IUserProps, IUserState> {
	state = {
		value: this.props.defaultValue,
	};
	render(): ReactNode {
		return (
			<span
				className="user-container"
				onClick={event => {
					this.props.toaster?.current?.addToast({
						modal: true,
						type: ToastType.info,
						message: this.ML("Are you sure you want to log off?"),
						buttons: [
							{
								text: this.ML("Yes"),
								callback: (() => {
									this.logoff();
									location.reload();
								}).bind(this),
							},
							{ text: this.ML("No"), callback: () => {} },
						],
					});
				}}>
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
