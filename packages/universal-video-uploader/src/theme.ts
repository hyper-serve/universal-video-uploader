export const colors = {
	accent: "#5589F1",
	textPrimary: "#374151",
	textMuted: "#9ca3af",
	textSecondary: "#6b7280",
	border: "#e5e7eb",
	borderLight: "#d1d5db",
	bgSubtle: "#f3f4f6",
	bgCard: "#f9fafb",
	bgPlaceholder: "#F8F9FC",
	borderPlaceholder: "#EAEFF5",
	iconMuted: "#8D99AE",
	error: "#dc2626",
	dropZoneBg: "#fafafa",
	dropZoneActiveBg: "#f0f4ff",
	dropZoneBorder: "#d1d5db",
	dropZoneActiveBorder: "#5589F1",
	white: "#fff",
} as const;

export const radius = {
	sm: 4,
	md: 8,
	lg: 10,
	xl: 12,
	pill: 9999,
} as const;

// Canonical pixel font sizes (Web converts to rem, Native uses as dp)
export const fontScale = {
	xs: 11, // badges
	sm: 13, // meta text
	md: 14, // body text
	lg: 15, // primary labels
	xl: 18, // icon buttons
} as const;

// Canonical pixel spacing scale
export const spacingScale = {
	xxs: 4,
	xs: 8,
	sm: 10,
	md: 12,
	lg: 14,
	xl: 16,
	sectionY: 40,
	sectionX: 16,
	dropZone: 24,
	cardY: 14,
	cardRowY: 12,
	cardX: 16,
} as const;

