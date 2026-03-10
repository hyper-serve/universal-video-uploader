import React, { useState } from "react";
import { ComposableBase } from "./examples/ComposableBase";
import { ComposableCustom } from "./examples/ComposableCustom";
import { ComposablePrimitives } from "./examples/ComposablePrimitives";
import { HeadlessFull } from "./examples/HeadlessFull";

const examples = [
	{ component: HeadlessFull, label: "1. Headless" },
	{ component: ComposableBase, label: "2. Zero Config" },
	{ component: ComposablePrimitives, label: "3. Composable (Primitives)" },
	{ component: ComposableCustom, label: "4. Composable (Custom)" },
] as const;

export function App() {
	const [activeTab, setActiveTab] = useState(0);
	const ActiveExample = examples[activeTab].component;

	return (
		<div style={styles.container}>
			<h1 style={styles.title}>Universal Video Uploader – Examples</h1>
			<p style={styles.subtitle}>
				Set your Hyperserve API key and base URL below, then explore each
				example.
			</p>

			<nav style={styles.nav}>
				{examples.map((example, i) => (
					<button
						key={example.label}
						onClick={() => setActiveTab(i)}
						style={{
							...styles.tab,
							...(i === activeTab ? styles.tabActive : {}),
						}}
						type="button"
					>
						{example.label}
					</button>
				))}
			</nav>

			<div style={styles.panel}>
				<ActiveExample />
			</div>
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	container: {
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
		margin: "0 auto",
		maxWidth: 900,
		padding: "2rem",
	},
	nav: {
		borderBottom: "2px solid #e2e8f0",
		display: "flex",
		gap: "0.25rem",
		marginBottom: "1.5rem",
	},
	panel: {
		minHeight: 300,
	},
	subtitle: {
		color: "#64748b",
		marginBottom: "2rem",
	},
	tab: {
		background: "none",
		border: "none",
		borderBottom: "2px solid transparent",
		color: "#64748b",
		cursor: "pointer",
		fontSize: "0.9rem",
		fontWeight: 500,
		marginBottom: "-2px",
		padding: "0.75rem 1rem",
	},
	tabActive: {
		borderBottomColor: "#3b82f6",
		color: "#1e293b",
	},
	title: {
		fontSize: "1.5rem",
		marginBottom: "0.5rem",
	},
};
