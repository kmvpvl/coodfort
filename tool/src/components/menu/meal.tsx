import { ReactNode } from "react";
import Proto, { IProtoProps, IProtoState } from "../proto";

export interface IMealProps extends IProtoProps {}

export interface IMealState extends IProtoState {}

export default class Meal extends Proto<IMealProps, IMealState> {
	render(): ReactNode {
		return <></>;
	}
}
