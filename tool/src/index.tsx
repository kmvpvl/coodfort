import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import EmployeeApp from "./employeeApp";
import GuestApp from "./guestApp";
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

window.Telegram.WebApp.expand();

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
						first_name: string;
						photo_url: string;
						username: string;
						start_param: string;
					};
				};
				expand: () => void;
			};
		};
	}
}

function getContentByPath(): React.ReactNode {
	const path = window.location.pathname.substring(1);
	console.log("path", path);
	const params = new URLSearchParams(window.location.search);
	switch (path) {
		case "guest":
			return (
				<GuestApp
					mode={params.get("mode") ? (params.get("mode") as string) : undefined}
					eateryId={params.get("eateryId") ? parseInt(params.get("eateryId") as string) : undefined}
					tableId={params.get("tableId") ? parseInt(params.get("tableId") as string) : undefined}
				/>
			);
		default:
			return <EmployeeApp mode={path} />;
	}
}
root.render(<React.StrictMode>{getContentByPath()}</React.StrictMode>);
