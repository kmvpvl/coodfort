import "./mlstring.css";
import React from "react";
import { Types } from "@betypes/prototypes";

export interface IMLStringEditorProps {
	defaultValue?: Types.IMLString;
	caption?: string;
	onChange?: (newMLString: Types.IMLString) => void;
	className?: string;
}

export interface IMLStringEditorState {
	value: Types.IMLString;
}

export default class MLStringEditor extends React.Component<IMLStringEditorProps, IMLStringEditorState> {
	state: IMLStringEditorState = {
		value: this.props.defaultValue !== undefined ? this.props.defaultValue : "",
	};
	get value(): Types.IMLString {
		return this.state.value;
	}
	render(): React.ReactNode {
		const langs = (process.env.LANGUAGES !== undefined ? process.env.LANGUAGES : "en,fr,de,es,it,ru").split(",");
		return (
			<div className={`mlstring-editor-container has-caption ${this.props.className}`}>
				<div className="caption">{this.props.caption}</div>
				<div className="toolbar">
					<span
						onClick={event => {
							if (this.state.value !== undefined) {
								const nState = this.state;
								if (typeof nState.value !== "object") {
									(nState.value as any) = {
										default: nState.value,
										values: [["", ""]],
									};
								} else {
									if ((nState.value as any).values.filter((v: any) => v[0] === "").length === 0) (nState.value as any).values.push(["", ""]);
								}
								this.setState(nState);
							}
						}}>
						+
					</span>
				</div>
				<div className="mlstring-editor-default">
					<input
						defaultValue={typeof this.state.value === "string" ? (this.state.value as string) : this.state.value?.default}
						onChange={event => {
							const nState = this.state;

							if (typeof nState.value === "object") {
								nState.value.default = event.currentTarget.value;
							} else {
								(nState.value as any) = {
									default: event.currentTarget.value,
									values: [],
								};
							}
							if (this.props.onChange !== undefined) this.props.onChange(this.value);
							this.setState(nState);
						}}
					/>
				</div>
				{this.state.value !== undefined && (this.state.value as any).values !== undefined ? (
					(this.state.value as any).values.map((langString: any, idx: any) => (
						<div className="mlstring-editor-value" key={idx}>
							<div className="mlstring-editor-value-toolbar">
								<span
									data-value-index={idx}
									onClick={event => {
										const index = event.currentTarget.getAttribute("data-value-index");
										const nState = this.state;
										(nState.value as any).values.splice(index, 1);
										if (this.props.onChange !== undefined) this.props.onChange(this.value);
										this.setState(nState);
									}}>
									✖
								</span>
							</div>
							<select
								data-value-index={idx}
								defaultValue={langString[0]}
								onChange={event => {
									const index = event.currentTarget.getAttribute("data-value-index");
									const nState = this.state;
									if (index) {
										(nState.value as any).values[index][0] = event.currentTarget.value;
										if (this.props.onChange !== undefined) this.props.onChange(this.value);
										this.setState(nState);
									}
								}}>
								<option key={-1}></option>
								{langs.map((v, i) => (
									<option key={i} value={v}>
										{v}
									</option>
								))}
							</select>
							<input
								data-value-index={idx}
								defaultValue={langString[1]}
								onChange={event => {
									const index = event.currentTarget.getAttribute("data-value-index");
									const nState = this.state;
									if (index) {
										(nState.value as any).values[index][1] = event.currentTarget.value;
										if (this.props.onChange !== undefined) this.props.onChange(this.value);
										this.setState(nState);
									}
								}}></input>
						</div>
					))
				) : (
					<></>
				)}
			</div>
		);
	}
}
