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
		`Welcome! This content creation and editing system is part of a larger system for interaction between psychologists, their clients, employers and their employees. The system is aimed at increasing the comfort of interaction and improving the quality of life of all participants. The system will allow you to create content, send a task to the participant for assessment, monitor implementation and calculate the emotional azimuth of the participant. Read more details about the system here`,
		new Map([
			[
				`de`,
				`Willkommen! Dieses System zur Erstellung und Bearbeitung von Inhalten ist Teil eines größeren Systems zur Interaktion zwischen Psychologen, ihren Klienten, Arbeitgebern und ihren Mitarbeitern. Das System zielt darauf ab, den Interaktionskomfort zu erhöhen und die Lebensqualität aller Teilnehmer zu verbessern. Das System ermöglicht es Ihnen, Inhalte zu erstellen, dem Teilnehmer eine Aufgabe zur Bewertung zu senden, die Umsetzung zu überwachen und den emotionalen Azimut des Teilnehmers zu berechnen. Weitere Einzelheiten zum System finden Sie hier`,
			],
			[
				`fr`,
				`Accueillir! Ce système de création et d'édition de contenu fait partie d'un système plus vaste d'interaction entre les psychologues, leurs clients, les employeurs et leurs employés. Le système vise à augmenter le confort d'interaction et à améliorer la qualité de vie de tous les participants. Le système vous permettra de créer du contenu, d'envoyer une tâche au participant pour évaluation, de surveiller la mise en œuvre et de calculer l'azimut émotionnel du participant. Lire plus de détails sur le système ici`,
			],
			[
				`es`,
				`¡Bienvenido! Este sistema de creación y edición de contenidos es parte de un sistema más amplio de interacción entre psicólogos, sus clientes, empleadores y sus empleados. El sistema tiene como objetivo aumentar la comodidad de la interacción y mejorar la calidad de vida de todos los participantes. El sistema le permitirá crear contenido, enviar una tarea al participante para su evaluación, monitorear su implementación y calcular el azimut emocional del participante. Lea más detalles sobre el sistema aquí`,
			],
			[
				`uk`,
				`Ласкаво просимо! Ця система створення та редагування контенту є частиною більшої системи взаємодії між психологами, їхніми клієнтами, роботодавцями та їхніми працівниками. Система спрямована на підвищення комфорту взаємодії та покращення якості життя всіх учасників. Система дозволить створювати контент, відправляти завдання учаснику на оцінку, контролювати виконання та розраховувати емоційний азимут учасника. Детальніше про систему читайте тут`,
			],
			[
				`ru`,
				`Добро пожаловать! Эта система создания и редактирования контента является частью большой системы для взаимодействия психологов, их клиентов, работодателей и их работников. Система нацелена на повышение комфортности взаимодействия и улучшения качества жизни всех участников. Система позволит Вам создать контент, направить задание участнику на оценку, проконтролировать выполнение и вычислить эмоциональный азимут участника. Больше подробностей о системе прочитайте тут`,
			],
			[
				`it`,
				`Benvenuto! Questo sistema di creazione e modifica dei contenuti fa parte di un sistema più ampio di interazione tra psicologi, i loro clienti, datori di lavoro e i loro dipendenti. Il sistema ha lo scopo di aumentare il comfort di interazione e migliorare la qualità della vita di tutti i partecipanti. Il sistema ti consentirà di creare contenuti, inviare un'attività al partecipante per la valutazione, monitorare l'implementazione e calcolare l'azimut emotivo del partecipante. Leggi maggiori dettagli sul sistema qui`,
			],
		]),
	],
	[
		`My emotions`,
		new Map([
			["ru", "Мои эмоции"],
			["de", "Meine Gefühle"],
			["es", "Mis emociones"],
			["uk", "мої емоції"],
		]),
	],
	[
		`Assess`,
		new Map([
			["ru", "Оценить"],
			["de", "Bewerten"],
			["es", "Evaluar"],
			["uk", "Оцінити"],
		]),
	],
	[
		`Skip`,
		new Map([
			[`de`, `Überspringen`],
			[`fr`, `Sauter`],
			[`es`, `Saltar`],
			[`uk`, `Пропустити`],
			[`ru`, `Пропустить`],
			[`it`, `Saltare`],
		]),
	],
	[
		`There is not more content items to assess. Ask your HR manager or psychologist to add ones`,
		new Map([
			[`de`, `Es gibt keine weiteren Inhalte zu bewerten. Bitten Sie Ihren Personalleiter oder Psychologen, weitere hinzuzufügen.`],
			[`fr`, `Il n'y a plus d'éléments de contenu à évaluer. Demandez à votre responsable RH ou à votre psychologue d'en ajouter.`],
			[`es`, `No hay más elementos de contenido para evaluar. Pídale a su gerente de recursos humanos o psicólogo que agregue algunos.`],
			[`uk`, `Немає більше елементів вмісту для оцінки. Попросіть свого менеджера з персоналу або психолога додати їх`],
			[`ru`, `Больше нет элементов контента для оценки. Попросите своего менеджера по персоналу или психолога добавить их`],
			[`it`, `Non ci sono altri elementi di contenuto da valutare. Chiedi al tuo responsabile delle risorse umane o allo psicologo di aggiungerne`],
		]),
	],
	[
		`Press button to request new content items`,
		new Map([
			[`de`, `Klicken Sie auf die Schaltfläche, um neue Inhaltselemente anzufordern`],
			[`fr`, `Appuyez sur le bouton pour demander de nouveaux éléments de contenu`],
			[`es`, `Pulse el botón para solicitar nuevos contenidos`],
			[`uk`, `Натисніть кнопку, щоб запитати нові елементи вмісту`],
			[`ru`, `Нажмите кнопку, чтобы запросить новые элементы контента`],
			[`it`, `Premi il pulsante per richiedere nuovi elementi di contenuto`],
		]),
	],
	[
		`Write message here...`,
		new Map([
			[`de`, `Schreiben Sie hier eine Nachricht...`],
			[`fr`, `Écrivez un message ici...`],
			[`es`, `Escribe un mensaje aquí...`],
			[`uk`, `Напишіть повідомлення тут...`],
			[`ru`, `Напишите сообщение здесь...`],
			[`it`, `Scrivi un messaggio qui...`],
		]),
	],
	[
		`common assessments`,
		new Map([
			[`de`, `gemeinsame Beurteilungen`],
			[`fr`, `évaluations communes`],
			[`es`, `Evaluaciones comunes`],
			[`uk`, `загальні оцінки`],
			[`ru`, `общие оценки`],
			[`it`, `valutazioni comuni`],
		]),
	],
	[
		`male`,
		new Map([
			[`de`, `Männlich`],
			[`fr`, `Mâle`],
			[`es`, `Masculina`],
			[`uk`, `Чоловік`],
			[`ru`, `Мужчина`],
		]),
	],
	[
		`female`,
		new Map([
			[`de`, `Weiblich`],
			[`fr`, `Femelle`],
			[`es`, `Femenina`],
			[`uk`, `Жінка`],
			[`ru`, `Женщина`],
		]),
	],
	[
		`their`,
		new Map([
			[`de`, `Anderes Geschlecht`],
			[`fr`, `Leur`],
			[`es`, `Otro género`],
			[`uk`, `Інша стать`],
			[`ru`, `Другой`],
		]),
	],
	[
		`age`,
		new Map([
			[`de`, `Alter`],
			[`fr`, `âge`],
			[`es`, `edad`],
			[`uk`, `вік`],
			[`ru`, `возраст`],
			[`it`, `età`],
		]),
	],
	[
		`language`,
		new Map([
			[`de`, `Sprache`],
			[`fr`, `langue`],
			[`es`, `idioma`],
			[`uk`, `мова`],
			[`ru`, `язык`],
			[`it`, `lingua`],
		]),
	],
	[
		`gender`,
		new Map([
			[`de`, `Geschlecht`],
			[`fr`, `genre`],
			[`es`, `género`],
			[`uk`, `стать`],
			[`ru`, `пол`],
			[`it`, `genere`],
		]),
	],
	[
		`You're ready to match`,
		new Map([
			[`de`, `Du bist bereit für das Match`],
			[`fr`, `Vous êtes prêt à correspondre`],
			[`es`, `Estás listo para combinar`],
			[`uk`, `Ви готові до пари`],
			[`ru`, `Вы готовы к матчу`],
			[`it`, `Sei pronto per abbinare`],
		]),
	],
	[
		`You're not reachable`,
		new Map([
			[`de`, `Du bist nicht erreichbar`],
			[`fr`, `Vous n'êtes pas joignable`],
			[`es`, `No estás localizable`],
			[`uk`, `Ви недоступні`],
			[`ru`, `Вы недоступны`],
			[`it`, `Non sei raggiungibile`],
		]),
	],
	[
		`My mutuals`,
		new Map([
			[`de`, `Meine Genossenschaften`],
			[`fr`, `Mes mutuelles`],
			[`es`, `Mis mutuas`],
			[`uk`, `Мої взаємні стосунки`],
			[`ru`, `Мои взаимные`],
			[`it`, `I miei reciproci`],
		]),
	],
	[
		`No more match. Invite friend`,
		new Map([
			[`de`, `Kein Match mehr. Freund einladen`],
			[`fr`, `Plus de match. Inviter un ami`],
			[`es`, `No hay más coincidencias. Invitar a un amigo`],
			[`uk`, `Більше немає збігу. Запросити друга`],
			[`ru`, `Больше нет совпадений. Пригласить друга`],
			[`it`, `Nessuna corrispondenza. Invita un amico`],
		]),
	],
	[
		`Invite your friends to check out their emotional azimuth`,
		new Map([
			[`de`, `Laden Sie Ihre Freunde ein, ihren emotionalen Azimut zu überprüfen`],
			[`fr`, `Invitez vos amis à découvrir leur azimut émotionnel`],
			[`es`, `Invita a tus amigos a comprobar su acimut emocional.`],
			[`uk`, `Запросіть друзів перевірити їхній емоційний азимут`],
			[`ru`, `Пригласите своих друзей проверить их эмоциональный азимут.`],
			[`it`, `Invita i tuoi amici a dare un'occhiata al loro azimut emotivo`],
		]),
	],
	[
		`Clear all skipped`,
		new Map([
			[`de`, `Alle übersprungenen löschen`],
			[`fr`, `Effacer tout ce qui a été ignoré`],
			[`es`, `Borrar todo lo omitido`],
			[`uk`, `Очистити всі пропущені`],
			[`ru`, `Очистить все пропущенные`],
			[`it`, `Cancella tutto ciò che è stato saltato`],
		]),
	],
	[
		`Clear all liked`,
		new Map([
			[`de`, `Alle „Gefällt mir“-Angaben löschen`],
			[`fr`, `Effacer tout aimé`],
			[`es`, `Borrar todo lo que me gusta`],
			[`uk`, `Очистити все сподобалось`],
			[`ru`, `Очистить все понравившиеся`],
			[`it`, `Cancella tutto ciò che è piaciuto`],
		]),
	],
	[
		`I want to be matched`,
		new Map([
			[`de`, `Ich möchte gematcht werden`],
			[`fr`, `Je veux être jumelé`],
			[`es`, `Quiero que me emparejen`],
			[`uk`, `Я хочу, щоб мене збігали`],
			[`ru`, `Я хочу, чтобы меня подобрали`],
			[`it`, `Voglio essere abbinato`],
		]),
	],
	[
		`I don't want to be matched`,
		new Map([
			[`de`, `Ich möchte nicht gematcht werden`],
			[`fr`, `Je ne veux pas être mis en correspondance`],
			[`es`, `No quiero que me emparejen`],
			[`uk`, `Я не хочу, щоб мене збігали`],
			[`ru`, `Я не хочу, чтобы меня сравнивали.`],
			[`it`, `Non voglio essere abbinato`],
		]),
	],
	[
		`Skipped list is clear`,
		new Map([
			[`de`, `Die übersprungene Liste ist klar`],
			[`fr`, `La liste ignorée est claire`],
			[`es`, `La lista omitida está clara`],
			[`uk`, `Пропущений список зрозумілий`],
			[`ru`, `Пропущенный список очищен`],
			[`it`, `L'elenco saltato è chiaro`],
		]),
	],
	[
		`Liked list was clear`,
		new Map([
			[`de`, `Die Liste der Likes war klar`],
			[`fr`, `La liste des favoris était claire`],
			[`es`, `La lista de me gusta estaba clara`],
			[`uk`, `Список лайків був зрозумілим`],
			[`ru`, `Список понравившихся был очищен`],
			[`it`, `L'elenco dei preferiti era chiaro`],
		]),
	],
	[
		`The emotions listed below are the most prevalent in you compared to people who assessed the same content. The emotions are listed in descending order of intensity.`,
		new Map([
			[`de`, `Die unten aufgeführten Emotionen sind bei Ihnen im Vergleich zu Personen, die dieselben Inhalte bewertet haben, am stärksten ausgeprägt. Die Emotionen sind in absteigender Reihenfolge der Intensität aufgeführt.`],
			[`fr`, `Les émotions énumérées ci-dessous sont celles qui prévalent le plus chez vous par rapport aux personnes ayant évalué le même contenu. Les émotions sont classées par ordre décroissant d'intensité.`],
			[`es`, `Las emociones que se enumeran a continuación son las más frecuentes en usted en comparación con las personas que evaluaron el mismo contenido. Las emociones se enumeran en orden descendente de intensidad.`],
			[`uk`, `Перелічені нижче емоції є найбільш поширеними у вас порівняно з людьми, які оцінювали той самий вміст. Емоції перераховані в порядку зменшення інтенсивності.`],
			[`ru`, `Перечисленные ниже эмоции являются наиболее распространенными у вас по сравнению с людьми, оценивавшими тот же контент. Эмоции перечислены в порядке убывания интенсивности.`],
			[`it`, `Le emozioni elencate di seguito sono le più diffuse in te rispetto alle persone che hanno valutato lo stesso contenuto. Le emozioni sono elencate in ordine decrescente di intensità.`],
		]),
	],
	[
		`Content items' vector`,
		new Map([
			[`de`, `Vektor der Inhaltselemente`],
			[`fr`, `Vecteur des éléments de contenu`],
			[`es`, `Vector de elementos de contenido`],
			[`uk`, `Вектор елементів вмісту`],
			[`ru`, `Вектор элементов контента`],
			[`it`, `Vettore degli elementi del contenuto`],
		]),
	],
	[
		`My vector`,
		new Map([
			[`de`, `Mein Vektor`],
			[`fr`, `Mon vecteur`],
			[`es`, `Mi vector`],
			[`uk`, `Мій вектор`],
			[`ru`, `Мой вектор`],
			[`it`, `Il mio vettore`],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
	[
		``,
		new Map([
			[`de`, ``],
			[`fr`, ``],
			[`es`, ``],
			[`uk`, ``],
			[`ru`, ``],
			[`it`, ``],
		]),
	],
]);
