import {
	themeColors,
	themeRadius,
	themeFontScale,
	themeSpacingScale,
} from "@hyperserve/universal-video-uploader";

export const colors = themeColors;

export const radius = themeRadius;

export const fontSize = {
	xs: `${themeFontScale.xs / 16}rem`,
	sm: `${themeFontScale.sm / 16}rem`,
	md: `${themeFontScale.md / 16}rem`,
	lg: `${themeFontScale.lg / 16}rem`,
	xl: `${themeFontScale.xl / 16}rem`,
} as const;

export const spacing = {
	xxs: `${themeSpacingScale.xxs / 16}rem`,
	xs: `${themeSpacingScale.xs / 16}rem`,
	sm: `${themeSpacingScale.sm / 16}rem`,
	md: `${themeSpacingScale.md / 16}rem`,
	lg: `${themeSpacingScale.lg / 16}rem`,
	xl: `${themeSpacingScale.xl / 16}rem`,
	sectionY: `${themeSpacingScale.sectionY / 16}rem`,
	sectionX: `${themeSpacingScale.sectionX / 16}rem`,
	dropZone: `${themeSpacingScale.dropZone / 16}rem`,
	cardY: `${themeSpacingScale.cardY / 16}rem`,
	cardRowY: `${themeSpacingScale.cardRowY / 16}rem`,
	cardX: `${themeSpacingScale.cardX / 16}rem`,
} as const;

export const thumbnailShadow = "0 1px 3px rgba(0,0,0,0.06)";
