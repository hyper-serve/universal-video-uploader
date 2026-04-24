export const colors = {
	accent: "#5589F1",
	bgCard: "#f9fafb",
	bgPlaceholder: "#F8F9FC",
	bgSubtle: "#f3f4f6",
	border: "#e5e7eb",
	borderLight: "#d1d5db",
	borderPlaceholder: "#EAEFF5",
	dropZoneActiveBg: "#f0f4ff",
	dropZoneActiveBorder: "#5589F1",
	dropZoneBg: "#fafafa",
	dropZoneBorder: "#d1d5db",
	error: "#dc2626",
	iconMuted: "#8D99AE",
	textMuted: "#9ca3af",
	textPrimary: "#374151",
	textSecondary: "#6b7280",
	white: "#fff",
} as const;

export const radius = {
	lg: 10,
	md: 8,
	pill: 9999,
	sm: 4,
	xl: 12,
} as const;

// Canonical pixel font sizes (Web converts to rem, Native uses as dp)
export const fontScale = {
	lg: 15, // primary labels
	md: 14, // body text
	sm: 13, // meta text
	xl: 18, // icon buttons
	xs: 11, // badges
} as const;

// Canonical pixel spacing scale
export const spacingScale = {
	cardRowY: 12,
	cardX: 16,
	cardY: 14,
	dropZone: 24,
	lg: 14,
	md: 12,
	sectionX: 16,
	sectionY: 40,
	sm: 10,
	xl: 16,
	xs: 8,
	xxs: 4,
} as const;
