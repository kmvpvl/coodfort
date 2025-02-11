//
import { Types } from "@betypes/prototypes";

export default class MLString extends String {
	values: Map<string, string>;
	constructor(def: Types.IMLString | string) {
		super(typeof def !== "string" ? def.default : def);
		this.values = new Map();
		this.values = typeof def !== "string" ? new Map<string, string>(def.values) : new Map<string, string>();
	}
	public toString(lang?: string): string {
		if (!lang) lang = MLString.getLang();
		if (!this.values.has(lang)) lang = lang.split("-")[0];
		return (lang ? (this.values.has(lang) ? this.values.get(lang) : super.toString()) : super.toString()) as string;
	}
	public toJSON() {
		return {
			default: super.toString(),
			values: Array.from(this.values),
		};
	}
	get default() {
		return super.toString();
	}
	public static getLang(): string {
		const params: string[] = window.location.search.substring(1).split("&");
		let lang = window.navigator.language.split("-")[0];
		const lang_param = params.filter(v => v.split("=")[0] === "lang");
		if (lang_param !== undefined && lang_param.length > 0) lang = lang_param[0].split("=")[1];
		return lang;
	}
}

export const mlStrings = new Map([
	[
		`Your unclosed orders (tap to select or close):`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, `Ваши незакрытые заказы (нажмите, чтобы выбрать или закрыть):`],
			[`it`, undefined],
			[`sr`, `Ваше незатворене поруџбине (додирните да бисте изабрали или затворили):`],
		]),
	],
	[
		`Press to scan QR Code`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, `Нажмите, чтобы отсканировать QR-код`],
			[`it`, undefined],
			[`sr`, `Притисните да скенирате КР код`],
		]),
	],
	[
		`Cancel scan`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, `Отменить сканирование`],
			[`it`, undefined],
			[`sr`, `Откажи скенирање`],
		]),
	],
	[
		`CheckIn`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Регистрация"],
			[`it`, undefined],
			[`sr`, "Пријавите се"],
		]),
	],
	[
		`Menu`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Меню"],
			[`it`, undefined],
			[`sr`, "Мени"],
		]),
	],
	[
		`Order`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Заказ"],
			[`it`, undefined],
			[`sr`, "Ред"],
		]),
	],
	[
		`Scan the QR code on the table or next to the table to start choosing dishes in the order. As soon as your registration is confirmed by the staff of the institution, you can send an order for execution.`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Отсканируйте QR код на столе или рядом со столом, чтобы начать выбирать блюда в заказ. Как только Ваша регистрация будет подтверждена персоналом заведения, Вы сможете отправить заказ на исполнение."],
			[`it`, undefined],
			[`sr`, "Скенирајте КР код на столу или поред стола да бисте почели да бирате јела за своју поруџбину. Када особље установе потврди вашу регистрацију, моћи ћете да предате свој налог на извршење."],
		]),
	],
	[
		`By pressing the button, agree to use the camera. We use only the rear camera of your smartphone. Point the camera at the QR code, it is calculated automatically. You do not need to press the photo buttons`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "При нажатии кнопки согласитесь с использованием камеры. Мы используем только заднюю камеру Вашего смартфона. Наведите камеру на QR код, он считается автоматически. Кнопки фотографирования нажимать не требуется"],
			[`it`, undefined],
			[`sr`, "Кликом на дугме прихватате да користите камеру. Користимо само задњу камеру вашег паметног телефона. Усмерите камеру на КР код, он ће се аутоматски прочитати. Нема потребе да притискате ниједно фото дугме"],
		]),
	],
	[
		`Table`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Столик"],
			[`it`, undefined],
			[`sr`, "Сто"],
		]),
	],
	[
		`Restaraunt`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Ресторан"],
			[`it`, undefined],
			[`sr`, "Ресторан"],
		]),
	],
	[
		`Order number`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Номер заказа"],
			[`it`, undefined],
			[`sr`, "Број наруџбе"],
		]),
	],
	[
		`Total`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Итого"],
			[`it`, undefined],
			[`sr`, "Укупно"],
		]),
	],
	[
		``,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, undefined],
			[`it`, undefined],
			[`sr`, undefined],
		]),
	],
	[
		``,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, undefined],
			[`it`, undefined],
			[`sr`, undefined],
		]),
	],
	[
		``,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, undefined],
			[`it`, undefined],
			[`sr`, undefined],
		]),
	],
	[
		``,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, undefined],
			[`it`, undefined],
			[`sr`, undefined],
		]),
	],
	[
		``,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, undefined],
			[`it`, undefined],
			[`sr`, undefined],
		]),
	],
	[
		``,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, undefined],
			[`it`, undefined],
			[`sr`, undefined],
		]),
	],
	[
		``,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, undefined],
			[`it`, undefined],
			[`sr`, undefined],
		]),
	],
	[
		``,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, undefined],
			[`it`, undefined],
			[`sr`, undefined],
		]),
	],
	[
		``,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, undefined],
			[`it`, undefined],
			[`sr`, undefined],
		]),
	],
	[
		``,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, undefined],
			[`it`, undefined],
			[`sr`, undefined],
		]),
	],
	[
		``,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, undefined],
			[`it`, undefined],
			[`sr`, undefined],
		]),
	],
]);
