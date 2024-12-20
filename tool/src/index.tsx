import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import WebApp from "./WebApp";
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

function getContentByPath(): React.ReactNode {
	const path = window.location.pathname;
	const params = new URLSearchParams(window.location.search);
	switch (path) {
		default:
			return <WebApp mode="guest" />;
	}
}
root.render(<React.StrictMode>{getContentByPath()}</React.StrictMode>);
