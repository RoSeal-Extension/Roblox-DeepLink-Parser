import type DeepLinkParser from "./DeepLinkParser";
import type { DeepLink } from "./utils/deepLinks";

export type ExtractParameterType<T> = T extends DeepLink<
	infer U,
	infer _V,
	infer _W,
	infer X
>
	? {
			type: U;
			params: X;
		}
	: never;

export default class ParsedDeepLink<T extends DeepLink<string>> {
	private _deepLink: T;
	constructor(
		public data: ExtractParameterType<T>,
		private _deepLinkParser: DeepLinkParser,
	) {
		this._deepLink = (_deepLinkParser._deepLinks.find(
			(link) => link.name === data.type,
		) ?? {
			name: data.type,
		}) as T;
	}

	public toProtocolUrl(): string | null {
		if (!this._deepLink.toProtocolUrl) return null;

		const data = this.data;
		let path =
			typeof this._deepLink.toProtocolUrl === "function"
				? this._deepLink.toProtocolUrl(data.params)
				: this._deepLink.toProtocolUrl;

		const search = new URLSearchParams();

		for (const param in data.params) {
			const check = this._deepLink.arbitaryParameters?.[param];
			if (check && check !== "protocol") continue;

			if (path.includes(`{${param}}`)) {
				path = path.replace(
					`{${param}}`,
					data.params[param as keyof typeof data.params],
				);
				continue;
			}
			search.append(param, data.params[param as keyof typeof data.params]);
		}

		const url = new URL(
			`${this._deepLinkParser._urls.robloxPlayerDeepLinkProtocol}://${path}`,
		);
		url.search = search.toString();

		return url.toString();
	}

	public toWebsiteUrl(): string | null {
		if (!this._deepLink.toWebsiteUrl) return null;

		const data = this.data;
		let path =
			typeof this._deepLink.toWebsiteUrl === "function"
				? this._deepLink.toWebsiteUrl(data.params)
				: this._deepLink.toWebsiteUrl;

		const search = new URLSearchParams();

		for (const param in data.params) {
			const check = this._deepLink.arbitaryParameters?.[param];
			if (check && check !== "website") continue;

			if (path.includes(`{${param}}`)) {
				path = path.replace(
					`{${param}}`,
					data.params[param as keyof typeof data.params],
				);
				continue;
			}
			search.append(param, data.params[param as keyof typeof data.params]);
		}

		const url = new URL(
			`https://${this._deepLinkParser._urls.robloxUrl}${path}`,
		);
		url.search = search.toString();

		return url.toString();
	}

	public toAppsFlyerUrl(): string | null {
		const deepLinkMobile = this.toProtocolUrl();
		const deepLinkWeb = this.toWebsiteUrl();

		if (!deepLinkMobile && !deepLinkWeb) return null;

		const url = new URL(
			`https://${this._deepLinkParser._urls.appsFlyerBaseUrl}`,
		);
		if (deepLinkMobile) {
			url.searchParams.append("af_dp", deepLinkMobile);
			url.searchParams.append("deep_link_value", deepLinkMobile);
		}
		if (deepLinkWeb) {
			url.searchParams.append("af_web_dp", deepLinkWeb);
		}

		return url.toString();
	}
}
