import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { UploadProvider } from "@hyperserve/universal-video-uploader";
import { ComposableBase } from "./examples/ComposableFull";
import { ComposableCustom } from "./examples/ComposableCustom";
import { ComposablePrimitives } from "./examples/ComposablePrimitives";
import { HeadlessFull } from "./examples/HeadlessFull";
import { demoConfig } from "./examples/shared";

const tabs = [
	{ id: "headless", label: "1. Headless", component: HeadlessFull },
	{ id: "composable-base", label: "2. Zero Config", component: ComposableBase },
	{ id: "composable-primitives", label: "3. Composable (Primitives)", component: ComposablePrimitives },
	{ id: "composable-custom", label: "4. Composable (Custom)", component: ComposableCustom },
] as const;

export default function App() {
	const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("headless");
	const Active = tabs.find((t) => t.id === activeTab)?.component ?? HeadlessFull;

	return (
		<SafeAreaProvider>
		<UploadProvider config={demoConfig}>
			<SafeAreaView style={styles.container}>
				<StatusBar style="dark" />
				<ScrollView contentContainerStyle={styles.scroll}>
					<Text style={styles.title}>Universal Video Uploader – Examples</Text>
					<Text style={styles.subtitle}>React Native</Text>
					<Text style={styles.subtitleSmall}>
						Set your Hyperserve API key and base URL in Expo env, then explore each example.
					</Text>

					<View style={styles.tabRow}>
						{tabs.map((tab) => (
							<Pressable
								key={tab.id}
								onPress={() => setActiveTab(tab.id)}
								style={[styles.tab, activeTab === tab.id && styles.tabActive]}
							>
								<Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
									{tab.label}
								</Text>
							</Pressable>
						))}
					</View>

					<Active />
				</ScrollView>
			</SafeAreaView>
		</UploadProvider>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({
	container: { backgroundColor: "#fff", flex: 1 },
	scroll: { padding: 20, paddingTop: 48 },
	subtitle: { color: "#64748b", fontSize: 15, marginBottom: 4 },
	subtitleSmall: { color: "#94a3b8", fontSize: 12, marginBottom: 16 },
	tab: { borderBottomColor: "transparent", borderBottomWidth: 2, paddingHorizontal: 8, paddingVertical: 8 },
	tabActive: { borderBottomColor: "#3b82f6" },
	tabRow: { borderBottomColor: "#e2e8f0", borderBottomWidth: 1, flexDirection: "row", gap: 8, marginBottom: 12 },
	tabText: { color: "#64748b", fontSize: 13, fontWeight: "500" },
	tabTextActive: { color: "#1e293b" },
	title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
});
