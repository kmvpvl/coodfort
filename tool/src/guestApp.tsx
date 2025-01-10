import React, { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "./components/proto";
import "./guestApp.css";
import { Types } from "@betypes/prototypes";
import Pending from "./components/pending";

export interface IGuestAppProps extends IProtoProps {
	mode?: string;
	eatery?: Types.ObjectId;
	table?: Types.ObjectId;
	itemMenu?: Types.ObjectId;
	order?: Types.ObjectId;
}

export interface IGuestAppState extends IProtoState {}

export default class GuestApp extends Proto<IGuestAppProps, IGuestAppState> {
    state: IGuestAppState = {

    }
    componentDidMount(): void {
        this.login();
    }
	render(): ReactNode {
		return <div className="guest-app-container">
            <Pending ref={this.pendingRef}/>
        </div>;
	}
}
