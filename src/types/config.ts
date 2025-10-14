import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";

export type SiteConfig = {
	title: string;
	subtitle: string;

	lang:
		| "en"
		| "zh_CN"
		| "zh_TW"
		| "ja"
		| "ko"
		| "es"
		| "th"
		| "vi"
		| "tr"
		| "id";

	themeColor: {
		hue: number;
		fixed: boolean;
	};

	// 增加字體設定
	font: {
		zenMaruGothic: {
			enable: boolean;
		};
		hanalei: {
			enable: boolean;
		};
	};

	banner: {
		enable: boolean;
		src:
			| string
			| string[]
			| {
					desktop?: string | string[];
					mobile?: string | string[];
			  }; // 支持單個圖片、圖片列表
		position?: "top" | "center" | "bottom";
		carousel?: {
			enable: boolean; // 是否使用輪流播放
			interval: number; // 切換間隔時間（秒）
		};
		homeText?: {
			enable: boolean; // 是否在 Home 顯示自定義文字
			title?: string; // 主標題
			subtitle?: string | string[]; // 副標題
			typewriter?: {
				enable: boolean; // 是否啟用打字機效果
				speed: number; // 打字速度(毫秒)
				deleteSpeed: number; // 刪除速度（毫秒）
				pauseTime: number; // 完整顯示後的暫停時間（毫秒）
			};
		};
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
		navbar?: {
			transparentMode?: "semi" | "full" | "semifull"; // navbar 透明模式
		};
	};
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};

	favicon: Favicon[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
}

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
};

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset)[];
};

export type ProfileConfig = {
	avatar?: string;
	name: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
	}[];
};

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export type LIGHT_DARK_MODE =
	| typeof LIGHT_MODE
	| typeof DARK_MODE
	| typeof AUTO_MODE;

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ExpressiveCodeConfig = {
	theme: string;
};
