import { ReactNode } from "react";
import "./stars.css";
import React from "react";
import { MnemonicRating } from "@betypes/feedback";

export interface IStarsProps {
    rating?: MnemonicRating;
    onChange?: (rating: MnemonicRating)=> void;
}
export interface IStarsState {
    rating: MnemonicRating;
}

export default class Stars extends React.Component<IStarsProps, IStarsState> {
    state: IStarsState = {
        rating: this.props.rating !== undefined? this.props.rating : 0
    }
    render(): ReactNode {
        return <div className="stars-container">{[1,2,3,4,5].map(v=><span 
            key={v} 
            data-rating={v}
            onClick={event=>{
                const strR = event.currentTarget.attributes.getNamedItem("data-rating")?.value;
                if (strR) {
                    if (Number(strR) !== this.state.rating) {
                        this.setState({...this.state, rating:Number(strR)});
                        if (this.props.onChange !== undefined) this.props.onChange(Number(strR));
                    }
                }
            }}
        >{v>this.state.rating?"☆":"✮"}</span>)}<span onClick={event=> {
            this.setState({...this.state, rating: 0});
        }}>{this.state.rating >0?MnemonicRating[this.state.rating]:""}</span></div>

    }
}