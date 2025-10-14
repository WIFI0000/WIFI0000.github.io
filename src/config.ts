import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "──(﹙˓ᯤ˒﹚)──",
	subtitle: "嘗試連線中",
	lang: "en", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 305, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: true, // Hide the theme color picker for visitors
	},
	banner: {
		enable: true,
		src: [
			"assets/images/banner/d1.jpg",
			"assets/images/banner/d2.jpg",
			"assets/images/banner/d3.jpg",
			"assets/images/banner/d4.jpg",
			"assets/images/banner/d5.jpg",
			"assets/images/banner/d6.jpg",
			"assets/images/banner/d7.jpg",
		], // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		carousel: {
			enable: true,
			interval: 4,
		},
		homeText: {
			enable: true,
			title: "Hello, World!",

			subtitle: [
				"مرحباً",
				"สวัสดี",
				"Hola",
				"Bonjour",
				"안녕하세요",
				"こんにちは",
				"你好",
			],
			typewriter: {
				enable: true,
				speed: 100,
				deleteSpeed: 50,
				pauseTime: 3000,
			},
		},
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
		navbar: {
			transparentMode: "semifull", // 透明模式："semi" 透明加圓角，"full" 完全透明，"semifull" 動態透明
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		{
			src: "assets/images/icon.png",
			sizes: "32x32",
		},
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
	font: {
		zenMaruGothic: {
			enable: true, // 启用全局圆体适合日语和英语，对中文适配一般
		},
		hanalei: {
			enable: false, // 启用 Hanalei 字体作为全局字体，适合中文去使用
		},
	},
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://github.com/WIFI0000", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/profile.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "𝗠𝘂𝗭𝗶",
	bio: "𝘛𝘩𝘦𝘳𝘦 𝘢𝘳𝘦 𝘭𝘢𝘺𝘦𝘳𝘴 𝘰𝘧 𝘥𝘦𝘢𝘵𝘩 𝘢𝘯𝘥 𝘳𝘦𝘣𝘪𝘳𝘵𝘩 𝘪𝘯 𝘰𝘯𝘦 𝘱𝘦𝘳𝘴𝘰𝘯.",
	links: [
		{
			name: "islab",
			icon: "ic:twotone-school", // Visit https://icones.js.org/ for icon codes
			// You will need to install the corresponding icon set if it's not already included
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://is1ab.com/#/Member/2024/WIFI",
		},
		{
			name: "GitHub",
			icon: "iconoir:github-circle",
			url: "https://github.com/WIFI0000",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
