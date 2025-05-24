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
		`If you're a manager or owner of the new Eatery and want to register one`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Если вы управляющий или владелец нового заведения и хотите его зарегистрировать"],
			[`it`, undefined],
			[`sr`, "Ako ste menadžer ili vlasnik novog restorana i želite da ga registrujete"],
		]),
	],
	[
		`I want to register new Eatery`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Я хочу зарегистрировать новое заведение"],
			[`it`, undefined],
			[`sr`, "Želim da registrujem novi restoran"],
		]),
	],
	[
		`I'm a new Employee`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Я новый сотрудник"],
			[`it`, undefined],
			[`sr`, "Ja sam novi zaposleni"],
		]),
	],
	[
		`If you're have no account in CoodFort and you want create new account as an employee`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Если у вас нет учетной записи в CoodFort и вы хотите создать новую учетную запись как сотрудник"],
			[`it`, undefined],
			[`sr`, "Ako nemate nalog u CoodFort-u i želite da napravite novi nalog kao zaposleni"],
		]),
	],
	[
		`Log in`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Авторизоваться"],
			[`it`, undefined],
			[`sr`, "Prijavite se"],
		]),
	],
	[
		`I already have an account and want to access from a new device`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "У меня уже есть учетная запись и я хочу получить доступ с нового устройства"],
			[`it`, undefined],
			[`sr`, "Već imam nalog i želim da pristupim sa novog uređaja"],
		]),
	],
	[
		`Insert your token here`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Вставьте свой токен здесь"],
			[`it`, undefined],
			[`sr`, `Umetnite svoj token ovde`],
		]),
	],
	[
		`You can get your token on a device where you already have access, or restore it yourself via Telegram or contact support`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Свой токен вы можете получить на устройстве, где доступ уже есть, или восстановить самостоятельно через Телеграм или обратиться в поддержку"],
			[`it`, undefined],
			[`sr`, "Možete da dobijete svoj token na uređaju kome već imate pristup, ili ga sami vratite preko Telegrama ili kontaktirate podršku"],
		]),
	],
	[
		`I have token`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "У меня есть токен"],
			[`it`, undefined],
			[`sr`, "Imam žeton"],
		]),
	],
	[
		`Technical support bot`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Бот технической поддержки"],
			[`it`, undefined],
			[`sr`, "Bot za tehničku podršku"],
		]),
	],
	[
		`You've registered earlier and had token. Insert token or recover your token here`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Вы уже регистрировались ранее и у вас был токен. Вставьте токен или восстановите свой токен здесь"],
			[`it`, undefined],
			[`sr`, "Ranije ste se registrovali i imali ste token. Umetnite token ili povratite svoj token ovde"],
		]),
	],
	[
		`New Employee`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Новый сотрудник"],
			[`it`, undefined],
			[`sr`, "Novi zaposleni"],
		]),
	],
	[
		`To be able to restore access to your account in the future, we recommend obtaining an access token through a bot`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Чтобы в будущем была возможность восстановить доступ к своей учетной записи, рекомендуем получить токен для доступа через бот"],
			[`it`, undefined],
			[`sr`, "Da biste mogli da vratite pristup svom nalogu u budućnosti, preporučujemo vam da dobijete token za pristup preko bota"],
		]),
	],
	[
		`At the top is a list of all the establishments that are available to you. If you are a restaurant owner or manager, click the button at the top to create a page for your business.\nIf you are an employee of a previously registered restaurant, ask to be added as an employee. Then your employer will appear in the list of restaurants at the top.\nIn order for your employer to be able to add you as an employee, tell them your account`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[
				`ru`,
				"Наверху список всех заведений, которые Вам доступны. Если Вы владелец или менеджер ресторана, то нажмите на кнопку вверху, чтобы создать страницу для своего предприятия.\nЕсли Вы сотрудник уже ранее зарегистрированного ресторана, попросите добавить Вас как работника. И тогда Ваш работодатель появится в списке ресторанов вверху.\nЧтобы Ваш работодатель мог добавить Вас как работника, сообщите им Вашу учетную запись",
			],
			[`it`, undefined],
			[
				`sr`,
				"Iznad je lista svih ustanova koje su vam dostupne. Ako ste vlasnik ili menadžer restorana, kliknite na dugme iznad da biste napravili stranicu za svoje preduzeće.\nAko ste zaposleni u ranije registrovanom restoranu, zatražite da vas dodaju kao zaposlenog. I tada će se vaš poslodavac pojaviti na listi restorana na vrhu.\nDa biste dozvolili vašem poslodavcu da vas doda kao zaposlenog, dostavite mu informacije o svom nalogu",
			],
		]),
	],
	[
		`Never tell your employer your token. We strongly recommend that you keep it secret!`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Ни в коем случае не сообщайте Вашему работодателю Ваш токен. Мы настоятельно рекомендуем Вам хранить его в секрете!"],
			[`it`, undefined],
			[`sr`, "Ni pod kojim okolnostima ne otkrivajte svoj token svom poslodavcu. Toplo vam preporučujemo da to držite u tajnosti!"],
		]),
	],
	[
		`Oops disconnected... We're solving the issue`,
		new Map([
			[`de`, undefined],
			[`fr`, undefined],
			[`es`, undefined],
			[`ru`, "Упс, соединение прервано... Мы решаем проблему"],
			[`it`, undefined],
			[`sr`, "Ups, veza je prekinuta... Rešavamo problem"],
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
