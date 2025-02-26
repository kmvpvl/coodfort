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
		`Ordered`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Заказано"],
			[`it`, undefined],
			[`sr`, "Naručeno"],
		]),
	],
	[
		`Paid`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Оплачено"],
			[`it`, undefined],
			[`sr`, "Plaćeno"],
		]),
	],
	[
		`Status`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Статус"],
			[`it`, undefined],
			[`sr`, "Status"],
		]),
	],
	[
		`days ago`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "дней назад"],
			[`it`, undefined],
			[`sr`, "pre dana"],
		]),
	],
	[
		`min ago`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "минут назад"],
			[`it`, undefined],
			[`sr`, "pre minut"],
		]),
	],
	[
		`hours ago`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "часов назад"],
			[`it`, undefined],
			[`sr`, "pre sat"],
		]),
	],
	[
		`Draft`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Черновик"],
			[`it`, undefined],
			[`sr`, "Nacrt"],
		]),
	],
	[
		`Do you want to call waiter?`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Вы хотите позвать официанта?"],
			[`it`, undefined],
			[`sr`, "Hoćeš da pozoveš konobara?"],
		]),
	],
	[
		`Do you want to cancel the waiter call?`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Вы хотите отменить вызов официанта?"],
			[`it`, undefined],
			[`sr`, "Da li želite da otkažete poziv konobaru?"],
		]),
	],
	[
		`Yes`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Да"],
			[`it`, undefined],
			[`sr`, "Da"],
		]),
	],
	[
		`No`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Нет"],
			[`it`, undefined],
			[`sr`, "Ne"],
		]),
	],
	[
		`Meal`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Блюдо"],
			[`it`, undefined],
			[`sr`, "Obrok"],
		]),
	],
	[
		`Price`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Цена"],
			[`it`, undefined],
			[`sr`, "Cena"],
		]),
	],
	[
		`Qty.`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Колво"],
			[`it`, undefined],
			[`sr`, "Klčna"],
		]),
	],
	[
		`Cost`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Стоимость"],
			[`it`, undefined],
			[`sr`, "Trošak"],
		]),
	],
	[
		`Approved`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Одобрено"],
			[`it`, undefined],
			[`sr`, "Odobreno"],
		]),
	],
	[
		`Hide cancelled`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Скрыть отмены"],
			[`it`, undefined],
			[`sr`, "Sakrij je otkazano"],
		]),
	],
	[
		`Send all`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Отправить все"],
			[`it`, undefined],
			[`sr`, "Pošalji sve"],
		]),
	],
	[
		`Restaurant staff haven't approve your booking yet`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Персонал ресторана еще не одобрил ваше бронирование"],
			[`it`, undefined],
			[`sr`, "Osoblje restorana još uvek nije odobrilo vašu rezervaciju"],
		]),
	],
	[
		`just now`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "только что"],
			[`it`, undefined],
			[`sr`, "malopre"],
		]),
	],
	[
		`Registered`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Зарегистрирован"],
			[`it`, undefined],
			[`sr`, "Registrovan"],
		]),
	],
	[
		`Done`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Выполнен"],
			[`it`, undefined],
			[`sr`, "Gotovo"],
		]),
	],
	[
		`Leave your feedback here`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Оставьте свой отзыв здесь"],
			[`it`, undefined],
			[`sr`, "Ostavite svoje povratne informacije ovde"],
		]),
	],
	[
		`Publish`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Публиковать"],
			[`it`, undefined],
			[`sr`, "Objavite"],
		]),
	],
	[
		`Cancel`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Отмена"],
			[`it`, undefined],
			[`sr`, "Otkaži"],
		]),
	],
	[
		`excellently`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "превосходно"],
			[`it`, undefined],
			[`sr`, "odlično"],
		]),
	],
	[
		`nasty`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "противный"],
			[`it`, undefined],
			[`sr`, "gadno"],
		]),
	],
	[
		`ordinary`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "заурядно"],
			[`it`, undefined],
			[`sr`, "običan"],
		]),
	],
	[
		`nice`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "приятно"],
			[`it`, undefined],
			[`sr`, "lepo"],
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
