import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "./components/proto";
import "./guestApp.css";
import { Types } from "@betypes/prototypes";

export interface IGuestAppProps extends IProtoProps {
	mode?: string;
	eatery?: Types.ObjectId;
	table?: Types.ObjectId;
	itemMenu?: Types.ObjectId;
	order?: Types.ObjectId;
}

export interface IGuestAppState extends IProtoState {}

export default class GuestApp extends Proto<IGuestAppProps, IGuestAppState> {
	render(): ReactNode {
		return <div className="guest-app-container"></div>;
	}
}
