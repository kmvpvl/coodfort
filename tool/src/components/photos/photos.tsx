import { ReactNode } from "react";
import "./photos.css";
import React from "react";
import { IPhoto } from "@betypes/eaterytypes";

export interface IPhotosProps {
	defaultValue: IPhoto[];
	onChange?: (newValue: IPhoto[]) => void;
	editMode?: boolean;
	className?: string;
}

export interface IPhotosState {
	value: IPhoto[];
	currentPhotoIndex?: number;
}

export default class Photos extends React.Component<IPhotosProps, IPhotosState> {
	state: IPhotosState = {
		value: this.props.defaultValue,
		currentPhotoIndex: this.props.defaultValue.length > 0 ? 0 : undefined,
	};
	get value() {
		return this.state.value;
	}
	protected editModeLoadImages(files: FileList) {
		for (let i = 0; i < files.length; i++) {
			const file = files[i];

			if (!file.type.startsWith("image/")) {
				continue;
			}
			const reader = new FileReader();
			reader.onload = () => {
				const src = reader.result;
				if (src) {
					const nState = this.state;
					nState.value.push({
						url: src.toString(),
						caption: "",
					});
					this.setState(nState);
					if (this.props.onChange !== undefined) this.props.onChange(nState.value);
				}
			};
			reader.readAsDataURL(file);
		}
	}

	renderEditMode(): ReactNode {
		return (
			<div className={`photos-admin-edit-container has-caption ${this.props.className}`}>
				<span className="caption">Photos</span>
				<div className="toolbar">
					<label>
						+
						<input
							type="file"
							id="inputImages"
							hidden
							multiple
							accept="image/*"
							onChange={event => {
								const files = event.currentTarget.files;
								if (files) this.editModeLoadImages(files);
								event.currentTarget.value = "";
							}}></input>
					</label>{" "}
					or{" "}
					<span
						onDragEnter={event => {
							event.stopPropagation();
							event.preventDefault();
						}}
						onDragOver={event => {
							event.stopPropagation();
							event.preventDefault();
						}}
						onDrop={event => {
							event.stopPropagation();
							event.preventDefault();

							const dt = event.dataTransfer;
							const files = dt.files;
							this.editModeLoadImages(files);
						}}>
						drop files here
					</span>
				</div>
				<div className="photos-admin-list-container">
					{this.state.value.map((photo, idx) => (
						<span className="photo-admin-container" key={idx}>
							<img src={photo.url} />
						</span>
					))}
				</div>
			</div>
		);
	}
	render(): ReactNode {
		return (
			<>
				{this.props.editMode ? (
					this.renderEditMode()
				) : (
					<div className="photos-container">
						<div
							className="photo-container"
							onClick={event => {
								if (this.props.defaultValue.length > 0 && this.state.currentPhotoIndex !== undefined) {
									const nState = this.state;
									nState.currentPhotoIndex = nState.currentPhotoIndex === this.props.defaultValue.length - 1 ? 0 : this.state.currentPhotoIndex + 1;
									this.setState(nState);
								}
							}}>
							{this.state.currentPhotoIndex !== undefined ? <img src={this.props.defaultValue[this.state.currentPhotoIndex].url}></img> : <></>}
						</div>
						<div className="photos-scroll">
							{this.props.defaultValue.map((photo, idx) => (
								<span
									data-index={idx}
									key={idx}
									onMouseOver={event => {
										const key = event.currentTarget.attributes.getNamedItem("data-index")?.value;
										if (key !== undefined) {
											const i = parseInt(key);
											if (i !== this.state.currentPhotoIndex) {
												const nState = this.state;
												nState.currentPhotoIndex = i;
												this.setState(nState);
											}
										}
									}}>
									{idx === this.state.currentPhotoIndex ? `☉` : "⚬"}
								</span>
							))}
						</div>
					</div>
				)}
			</>
		);
	}
}
