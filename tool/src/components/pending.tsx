import { ReactNode } from "react";
import "./pending.css";
import React from "react";

export interface IPendingProps {};
export interface IPendingState {
    deepCount: number;
};

export default class Pending extends React.Component<IPendingProps, IPendingState> {
    state: IPendingState = {
        deepCount: 0
    }
    incDeepCount() {
        const nState = this.state;
        nState.deepCount += 1;
        this.setState(nState);
    }
    decDeepCount() {
        const nState = this.state;
        nState.deepCount -= 1;
        this.setState(nState);
    }
    render(): ReactNode {
        return <>{this.state.deepCount > 0?<div className="pending-container"><span>Loading...</span></div>:<></>}</>
    }
}