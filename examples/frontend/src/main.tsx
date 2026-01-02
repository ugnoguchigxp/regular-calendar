import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
// import 'regular-calendar/styles' // Removed to avoid potential conflict/duplication
import "./index.css";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
