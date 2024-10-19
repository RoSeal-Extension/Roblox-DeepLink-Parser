import type DeepLinkParser from "./DeepLinkParser";
import type { DeepLink } from "./utils/deepLinks";

export type ExtractParameterType<T> = T extends DeepLink<
	string,
	string,
	string,
	infer X
>
	? X
	: never;

export default class ParsedDeepLink<
	T extends DeepLink<string, string, string, string>,
> {
	constructor(
		public deepLink: T,
		public params: Record<ExtractParameterType<T>, string>,
		private _deepLinkParser: DeepLinkParser,
	) {}

	public toProtocolUrl() {
		if (!this.deepLink.toProtocolUrl) return null;

		let path =
			typeof this.deepLink.toProtocolUrl === "function"
				? this.deepLink.toProtocolUrl(this.params)
				: this.deepLink.toProtocolUrl;

		const search = new URLSearchParams();

		for (const param in this.params) {
			const check = this.deepLink.arbitaryParameters?.[param];
			if (check && check !== "protocol") continue;

			if (path.includes(`{${param}}`)) {
				path = path.replace(
					`{${param}}`,
					this.params[param as keyof typeof this.params],
				);
				continue;
			}
			search.append(param, this.params[param as keyof typeof this.params]);
		}

		const url = new URL(
			`${this._deepLinkParser._urls.robloxProtocol}://${path}`,
		);
		url.search = search.toString();

		return url.toString();
	}

	public toWebsiteUrl() {
		if (!this.deepLink.toWebsiteUrl) return null;

		let path =
			typeof this.deepLink.toWebsiteUrl === "function"
				? this.deepLink.toWebsiteUrl(this.params)
				: this.deepLink.toWebsiteUrl;

		const search = new URLSearchParams();

		for (const param in this.params) {
			const check = this.deepLink.arbitaryParameters?.[param];
			if (check && check !== "website") continue;

			if (path.includes(`{${param}}`)) {
				path = path.replace(
					`{${param}}`,
					this.params[param as keyof typeof this.params],
				);
				continue;
			}
			search.append(param, this.params[param as keyof typeof this.params]);
		}

		const url = new URL(
			`https://${this._deepLinkParser._urls.robloxUrl}${path}`,
		);
		url.search = search.toString();

		return url.toString();
	}

	public toAppsFlyerUrl() {
		const deepLinkMobile = this.toProtocolUrl();
		const deepLinkWeb = this.toWebsiteUrl();

		if (!deepLinkMobile && !deepLinkWeb) return null;

		const url = new URL(
			`https://${this._deepLinkParser._urls.appsFlyerBaseUrl}`,
		);
		if (deepLinkMobile) {
			url.searchParams.append("af_dp", deepLinkMobile);
		}
		if (deepLinkWeb) {
			url.searchParams.append("af_web_dp", deepLinkWeb);
		}

		return url.toString();
	}
}
