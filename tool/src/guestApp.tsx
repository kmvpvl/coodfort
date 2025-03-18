import { Types, WorkflowStatusCode } from "@betypes/prototypes";

import { Fragment, ReactNode } from "react";
import Proto, { IProtoProps, IProtoState, ServerStatusCode } from "./components/proto";
import "./guestApp.css";
import Pending from "./components/pending";
import Toaster, { ToastType } from "./components/toast";
import React from "react";
import Pinger from "./components/pinger/pinger";
import { Html5Qrcode } from "html5-qrcode";
import { IEatery, ITable } from "@betypes/eaterytypes";
import { Eatery } from "./components/eatery/eatery";
import { ViewModeCode } from "./components/proto";
import { revealTelegramStartAppParams } from "./model/tools";
import Menu from "./components/menu/menu";
import GuestOrder from "./components/order/guestOrder";
import { IOrder, IOrderItem } from "@betypes/ordertypes";

export interface IGuestAppProps extends IProtoProps {
	mode?: string;
	eateryId?: Types.ObjectId;
	tableId?: Types.ObjectId;
	itemMenuId?: Types.ObjectId;
}

const OrderStages = ["CheckIn", "Menu", "Order"];

export interface IGuestAppState extends IProtoState {
	eateryId?: Types.ObjectId;
	choosenEatery?: IEatery;
	tableId?: Types.ObjectId;
	choosenTable?: ITable;
	itemMenuId?: Types.ObjectId;
	passwordWrong?: boolean;
	connected?: boolean;
	scanner?: Html5Qrcode;
	stage?: string;
	order?: IOrder;
	activeOrders?: IOrder[];
	eateriesInfo: IEatery[];
}

export default class GuestApp extends Proto<IGuestAppProps, IGuestAppState> {
	protected toasterRef = React.createRef<Toaster>();
	protected orderRef = React.createRef<GuestOrder>();
	state: IGuestAppState = {
		eateryId: this.props.eateryId,
		tableId: this.props.tableId,
		eateriesInfo: [],
	};

	init() {
		this.login(
			undefined,
			res => {
				const nState = this.state;
				if (this.state.eateryId === undefined && this.state.tableId === undefined) {
					this.updateOrdersList();
					nState.stage = "checkin";
				} else {
					//nState.stage = "menu";
					this.checkEateryId();
				}
				this.setState(nState);
			},
			err => {
				if (err.json.httpCode !== undefined) {
					// server returns http status
					switch (err.json.httpCode) {
						case 404:
							// new user
							break;
						case 401:
							// existing user wrong login
							const nState = this.state;
							nState.passwordWrong = true;
							this.setState(nState);
							break;
						default:
					}
				} else {
					// server not available
					const nState = this.state;
					nState.passwordWrong = undefined;
					this.setState(nState);
				}
			}
		);
	}

	updateEateriesInfo() {
		if (this.state.activeOrders === undefined) return;
		for (const order of this.state.activeOrders) {
			if (this.state.eateriesInfo.filter(e => e.id === order.eateryId).length === 0) {
				this.serverCommand(
					"eatery/view",
					JSON.stringify({ id: order.eateryId }),
					res => {
						if (res.ok) {
							const nState = this.state;
							const idx = this.state.eateriesInfo.findIndex(e => e.id === res.eatery.id);
							if (idx !== -1) {
								nState.eateriesInfo[idx] = res.eatery;
							} else {
								nState.eateriesInfo.push(res.eatery);
							}
							this.setState(nState);
						}
					},
					err => {}
				);
			}
		}
	}

	updateOrdersList() {
		this.serverCommand(
			"user/ordersList",
			JSON.stringify({
				eateryId: this.state.eateryId,
				tableId: this.state.tableId,
				wfStatuses: [WorkflowStatusCode.draft, WorkflowStatusCode.approved],
			}),
			res => {
				if (res.ok) {
					const nState = this.state;
					nState.activeOrders = res.orders;
					if (res.orders.length !== 1) {
					} else {
						nState.order = res.orders[0];
					}
					this.updateEateriesInfo();
					this.setState(nState);
				}
			},
			err => {}
		);
	}

	informEateryTableInfo() {
		this.toasterRef.current?.addToast({
			type: ToastType.info,
			message: (
				<div>
					<div>Вы выбрали заведение и столик верно?</div>
					<button
						onClick={event => {
							const nState = this.state;
							nState.choosenEatery = undefined;
							nState.choosenTable = undefined;
							nState.stage = "checkin";
							this.setState(nState);
						}}>
						Нет, что-то пошло не так
					</button>
					<div>Сформируйте заказ. Если что-то забудете, то потом можно будет дополнить.</div>
					<div>
						Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the
						internet.
					</div>
				</div>
			),
		});
	}

	checkEateryId() {
		this.serverCommand(
			"eatery/view",
			JSON.stringify({ id: this.state.eateryId }),
			res => {
				const nState = this.state;
				nState.choosenEatery = res.eatery;
				if (this.state.tableId !== undefined) {
					const suitableTables = this.state.choosenEatery?.tables.filter(table => table.id === this.state.tableId);
					if (suitableTables?.length === 1) {
						nState.choosenTable = suitableTables[0];
					} else {
						this.toasterRef.current?.addToast({
							type: ToastType.error,
							message: "Choosen table doesn't belong to the Eatery",
						});
						const nState = this.state;
						nState.eateryId = undefined;
						nState.tableId = undefined;
						this.setState(nState);
						return;
					}
				}
				this.state.stage = "menu";
				this.setState(nState);
				this.updateOrdersList();
			},
			err => {
				const nState = this.state;
				nState.eateryId = undefined;
				nState.tableId = undefined;
				this.setState(nState);
			}
		);
	}
	/**
	 * 3-state interface
	 * passwordWrong and user are undefined both - greetings new user
	 * passwordWrong is true and user is undefined - fault login attempt of existing user
	 * user is not undefined - successful login attempt
	 */
	renderGreetings(): ReactNode {
		const tgUser = window.Telegram !== undefined && "user" in window.Telegram?.WebApp.initDataUnsafe ? window.Telegram?.WebApp.initDataUnsafe.user : null;
		if (tgUser?.photo_url !== undefined) {
			//            URI2DataURL(tgUser.photo_url, userpic=> {
			//                if (userpic) document.getElementById("user_pic")?.setAttribute("src", userpic as string);
			//            });
		}
		return (
			<div className="guest-app-greetings-container">
				<div style={{ textAlign: "center", fontSize: "120%" }}>Давайте познакомимся</div>
				<div>
					<span>{"Your default lang. We have other languages. Choose"}</span>
					<select defaultValue={tgUser?.language_code || this.getLanguage()}>
						{process.env.LANGUAGES?.split(",").map((lang, idx) => (
							<option key={idx} value={lang}>
								{lang}
							</option>
						))}
					</select>
				</div>
				<div className="guest-app-greetings-text">
					Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia,
					looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33
					of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit
					amet..", comes from a line in section 1.10.32.
				</div>
				<div className="guest-app-greetings-requisites">
					<div>
						{tgUser ? (
							<div style={{ height: "100%" }}>
								<img id="user_pic" src={tgUser.photo_url} />
							</div>
						) : (
							<></>
						)}
					</div>
					<div>
						<div>{tgUser ? "We've got your name and photo from Telegram" : "Enter your name"}</div>
						<input id="name" type="text" style={{ width: "100%" }} defaultValue={tgUser ? [tgUser.first_name, tgUser.last_name].join(" ") : undefined} />
					</div>

					<div>
						<div>Say smth about you</div>
						<textarea id="bio" style={{ width: "100%" }} />
					</div>
				</div>
				<div>
					<button
						style={{ width: "100%" }}
						onClick={event => {
							this.serverCommand(
								"user/new",
								JSON.stringify({
									name: document.getElementById("name")?.attributes.getNamedItem("value")?.value,
									bio: document.getElementById("bio")?.attributes.getNamedItem("value")?.value,
								}),
								res => {
									const nState = this.state;
									nState.user = res.user;
									this.setState(nState);
									this.checkEateryId();
								},
								err => {}
							);
						}}>
						Everything is correct. Let's move on
					</button>
				</div>
			</div>
		);
	}
	renderWrongToken(): ReactNode {
		return (
			<div>
				<div style={{ textAlign: "center", fontSize: "120%" }}>Your credential are wrong. Try recover your token in Telegram</div>
				<div>
					There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of
					Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the
					Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected
					humour, or non-characteristic words etc.
				</div>
				<div>
					<button
						onClick={event => {
							localStorage.removeItem("coodforttoken");
							const nState = this.state;
							nState.passwordWrong = undefined;
							this.setState(nState);
						}}>
						I want create new user
					</button>
				</div>
				<div>
					<button>I want recover my token</button>
				</div>
			</div>
		);
	}
	renderDisconnected(): ReactNode {
		return <div>⚠ Oops disconnected</div>;
	}
	startScanner() {
		const nState = this.state;
		nState.scanner = new Html5Qrcode("reader");
		nState.scanner.start(
			{ facingMode: "environment" },
			{ fps: 10, qrbox: { width: 200, height: 200 } },
			((decode: any, decoded: any) => {
				const [eateryId, tableId] = revealTelegramStartAppParams(decode);
				this.stopScanner();
				this.chooseEateryAndTable(eateryId, tableId);
			}).bind(this),
			err => {}
		);
		this.setState(nState);
	}

	stopScanner() {
		const nState = this.state;
		nState.scanner?.stop();
		delete nState.scanner;
		this.setState(nState);
	}
	chooseEateryAndTable(eateryId: Types.ObjectId, tableId: Types.ObjectId) {
		const nState = this.state;
		nState.eateryId = eateryId;
		nState.tableId = tableId;
		nState.activeOrders = undefined;
		nState.eateriesInfo = [];
		this.checkEateryId();
		this.setState(nState);
	}
	renderCheckIn(): ReactNode {
		return (
			<div className="guest-app-checkin-container">
				{this.state.activeOrders !== undefined && this.state.activeOrders.length > 0 && this.state.scanner === undefined ? (
					<div style={{ width: "100%", height: "100%", overflow: "hidden", display: "grid" }}>
						<div>{this.ML("Your unclosed orders (tap to select or close):")}</div>
						<div className="guest-app-checkin-unclosed-orders-list">
							{this.state.activeOrders?.map((order, idx) => {
								const eatery_arr = this.state.eateriesInfo.filter(e => e.id === order.eateryId);
								return (
									<GuestOrder onClick={order => this.chooseEateryAndTable(order.eateryId, order.tableId)} viewMode={ViewModeCode.normal} key={idx} orderId={order.id} eatery={eatery_arr[0]} eateryId={order.eateryId} tableId={order.eateryId} />
								);
							})}
						</div>
					</div>
				) : (
					<div></div>
				)}
				<div id="reader"></div>
				<div style={{ width: "100%", height: "100%", overflow: "hidden", display: "grid" }}>
					<div className="tooltip">
						{this.ML("Scan the QR code on the table or next to the table to start choosing dishes in the order. As soon as your registration is confirmed by the staff of the institution, you can send an order for execution.")}
					</div>
					{this.state.scanner === undefined ? (
						<div className="tooltip">
							{this.ML("By pressing the button, agree to use the camera. We use only the rear camera of your smartphone. Point the camera at the QR code, it is calculated automatically. You do not need to press the photo buttons")}
						</div>
					) : (
						<></>
					)}
					<button
						onClick={event => {
							if (this.state.scanner === undefined) this.startScanner();
							else this.stopScanner();
						}}>
						{this.state.scanner === undefined ? this.ML("Press to scan QR Code") : this.ML("Cancel scan")}
					</button>
				</div>
			</div>
		);
	}
	onSelectMenuItem(newItem: IOrderItem) {
		this.orderRef.current?.updateOrderItem(newItem);
	}

	renderChoose(): ReactNode {
		return (
			<div className="guest-app-choose-container">
				<Menu menuId={this.state.choosenEatery?.menuId} onSelectMenuItem={this.onSelectMenuItem.bind(this)} />
			</div>
		);
	}
	renderPay(): ReactNode {
		return this.state.choosenEatery !== undefined && this.state.eateryId !== undefined && this.state.tableId !== undefined && this.state.order !== undefined ? (
			<GuestOrder
				eatery={this.state.choosenEatery}
				viewMode={ViewModeCode.maximized}
				orderId={this.state.order.id}
				eateryId={this.state.eateryId}
				tableId={this.state.tableId}
				toaster={this.toasterRef}
				onChange={order => {
					//debugger
					const nState = this.state;
					nState.order = order;
					this.setState(nState);
				}}
			/>
		) : (
			<></>
		);
	}
	renderNavTop(): ReactNode {
		return (
			<div className="guest-app-nav-top">
				<div className="guest-app-nav-top-choosen">
					<span>{this.state.user?.name}</span>
					{this.state.choosenEatery !== undefined && this.state.stage !== "checkin" ? (
						<Eatery viewMode={ViewModeCode.compact} defaultValue={this.state.choosenEatery} toaster={this.toasterRef} tableToCompactRender={this.state.choosenTable?.id} />
					) : (
						<></>
					)}
				</div>
			</div>
		);
	}
	renderNavBottom(): ReactNode {
		const max_order_item_date = this.state.order?.items.reduce<string>((prev, curr) => (curr.changed !== undefined && new Date(curr.changed).toISOString() > prev ? new Date(curr.changed).toISOString() : prev), "");
		return (
			<div className="guest-app-nav-bottom">
				{this.state.user !== undefined ? (
					OrderStages.map((stage: string, idx: number, arr) => {
						const curStage = this.state.stage?.toLowerCase() === OrderStages[idx].toLowerCase();
						return (
							<Fragment key={idx}>
								<span
									data-stage={stage}
									onClick={event => {
										const choosenStage = event.currentTarget.attributes.getNamedItem("data-stage")?.value.toLowerCase();
										if (choosenStage !== this.state.stage && choosenStage !== undefined) {
											switch (choosenStage) {
												case "menu":
												case "order":
													if (this.state.eateryId === undefined || this.state.tableId === undefined || this.orderRef.current?.value?.id === undefined) break;
												default:
													const nState = this.state;
													nState.stage = choosenStage;
													this.setState(nState);
											}
										}
									}}
									className={`button stage ${curStage ? "current" : ""}`}>
									{stage === "Order" && this.state.eateryId !== undefined && this.state.tableId !== undefined && this.state.choosenEatery !== undefined ? (
										<GuestOrder
											ref={this.orderRef}
											eatery={this.state.choosenEatery}
											defaultValue={this.state.order}
											eateryId={this.state.eateryId}
											tableId={this.state.tableId}
											toaster={this.toasterRef}
											onChange={order => {
												const nState = this.state;
												nState.order = order;
												this.setState(nState);
											}}
											viewMode={ViewModeCode.compact}
											key={max_order_item_date}
										/>
									) : (
										this.ML(stage)
									)}
								</span>
								{idx + 1 < arr.length ? <span>→</span> : <></>}{" "}
							</Fragment>
						);
					})
				) : (
					<></>
				)}
			</div>
		);
	}
	render(): ReactNode {
		let content: ReactNode;
		if (this.state.connected === undefined || !this.state.connected || this.state.serverStatus === ServerStatusCode.connecting) {
			content = <div></div>;
		} else {
			if (this.state.connected === undefined || !this.state.connected) {
				content = this.renderDisconnected();
			} else if (this.state.user === undefined && !this.state.passwordWrong) {
				content = this.renderGreetings();
			} else if (this.state.user === undefined) {
				content = this.renderWrongToken();
			} else
				switch (this.state.stage) {
					case "checkin":
						content = this.renderCheckIn();
						break;
					case "menu":
						content = this.renderChoose();
						break;
					case "order":
						content = this.renderPay();
						break;
					default:
						content = <div>Something went wrong!</div>;
				}
		}
		return (
			<div className="guest-app-container">
				{this.renderNavTop()}
				{content}
				{this.renderNavBottom()}
				<Pending ref={this.pendingRef} />
				<Toaster placesCount={3} ref={this.toasterRef} />
				<Pinger
					onConnect={() => {
						this.init();
						const nState = this.state;
						nState.connected = true;
						this.setState(nState);
					}}
					onDisconnect={() => {
						const nState = this.state;
						nState.connected = false;
						this.setState(nState);
					}}
				/>
			</div>
		);
	}
}
