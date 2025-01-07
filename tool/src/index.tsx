import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import WebApp from "./WebApp";
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

declare global {
	interface Window {
		Telegram: {
			WebApp: {
				initData: string;
				initDataUnsafe: {
					auth_date: string;
					query_id: string;
					signature: string;
					hash: string;
					user: {
						id: number;
						language_code: string;
						last_name: string;
						photo_url: string;
						username: string;
					};
				};
				expand: () => void;
			};
		};
	}
}

function getContentByPath(): React.ReactNode {
	const path = window.location.pathname;
	console.log("path", path);
	const params = new URLSearchParams(window.location.search);
	switch (path) {
		case "/order":
			return <div>Guest collects the order</div>;
		default:
			return <WebApp mode="guest" />;
	}
}
root.render(<React.StrictMode>{getContentByPath()}</React.StrictMode>);
