import ParsedDeepLink, { type ExtractParameterType } from "./ParsedDeepLink";
import {
	DEFAULT_APPSYFLYER_BASE_URL,
	DEFAULT_ROBLOX_PROTOCOL,
	DEFAULT_ROBLOX_WEBSITE_URL,
	DEFAULT_ROBLOX_API_DOMAIN,
	LOCALE_REGEX,
} from "./utils/constants";
import { getDeepLinks, type DeepLink } from "./utils/deepLinks";

export type DeepLinkParserUrls = {
	appsFlyerBaseUrl: string;
	robloxProtocol: string;
	robloxUrl: string;
	robloxApiDomain: string;
};

export type DeepLinkParserConstructorProps = {
	urls?: Partial<DeepLinkParserUrls>;
	fetchFn?: typeof fetch;
};

export default class DeepLinkParser<
	// biome-ignore lint/suspicious/noExplicitAny: A very strange typescript issue
	T extends DeepLink<string, any, any, any> = ReturnType<
		typeof getDeepLinks
	>[number],
> {
	public _urls: DeepLinkParserUrls = {
		appsFlyerBaseUrl: DEFAULT_APPSYFLYER_BASE_URL,
		robloxProtocol: DEFAULT_ROBLOX_PROTOCOL,
		robloxUrl: DEFAULT_ROBLOX_WEBSITE_URL,
		robloxApiDomain: DEFAULT_ROBLOX_API_DOMAIN,
	};
	private _fetchFn: typeof fetch = fetch.bind(globalThis);
	public _deepLinks: T[];
	constructor(data?: DeepLinkParserConstructorProps) {
		if (data?.urls) {
			for (const _key in data.urls) {
				const key = _key as keyof DeepLinkParserUrls;
				if (data.urls[key]) this._urls[key] = data.urls[key] as string;
			}
		}

		if (data?.fetchFn) this._fetchFn = data.fetchFn;
		this._deepLinks = getDeepLinks(
			this._getUniverseRootPlaceId.bind(this),
			this._getPlaceUniverseId.bind(this),
			this._urls.robloxUrl,
		) as T[];
	}

	private _getPlaceUniverseId(placeId: number): Promise<number | null> {
		return this._fetchFn(
			`https://apis${this._urls.robloxApiDomain}/universes/v1/places/${placeId}/universe`,
		)
			.then((res) => res.json())
			.then((res) => res.universeId ?? null);
	}

	private _getUniverseRootPlaceId(universeId: number): Promise<number | null> {
		return this._fetchFn(
			`https://games${this._urls.robloxApiDomain}/v1/games?universeIds=${universeId}`,
		)
			.then((res) => res.json())
			.then((res) => res?.data?.[0]?.rootPlaceId ?? null);
	}

	public createDeepLink<U extends T["name"]>(
		type: U,
		params: ExtractParameterType<
			Extract<
				T,
				{
					name: U;
				}
			>
		>["params"],
	): ParsedDeepLink<
		Extract<
			T,
			{
				name: U;
			}
		>
	> | null {
		const deepLink = this._deepLinks.find((link) => link.name === type);
		if (!deepLink) return null;

		const validatedParams: Record<string, string> = {};
		const requiredParams: Set<string> = new Set();

		// Collect required parameters from protocol URLs
		if (deepLink.protocolUrls) {
			for (const url of deepLink.protocolUrls) {
				if (url.path) {
					for (const path of url.path) {
						// Add path parameters to tracked parameters
						if (params[path.name]) {
							// @ts-expect-error: fine
							validatedParams[path.name] = String(params[path.name]);
						}
					}
				}
				if (url.query) {
					for (const query of url.query) {
						const paramName =
							"mappedName" in query ? query.mappedName : query.name;

						// Track required parameters
						if (query.required === true) {
							requiredParams.add(String(paramName));
						}

						// Validate and add parameter if it exists
						if (params[paramName] !== undefined) {
							const value = String(params[paramName]);
							// Check regex pattern if available
							if (query.regex && !query.regex.test(value)) {
								continue;
							}

							// @ts-expect-error: fine
							validatedParams[paramName] = value;
						}
					}
				}
			}
		}

		// Also check website URLs for required parameters
		if (deepLink.websiteUrls) {
			for (const url of deepLink.websiteUrls) {
				if (url.path) {
					for (const path of url.path) {
						if (params[path.name]) {
							// @ts-expect-error: fine
							validatedParams[path.name] = String(params[path.name]);
						}
					}
				}
				if (url.query) {
					for (const query of url.query) {
						const paramName =
							"mappedName" in query ? query.mappedName : query.name;

						// Track required parameters
						if (query.required === true) {
							requiredParams.add(String(paramName));
						}

						// Validate and add parameter if it exists
						if (params[paramName] !== undefined) {
							const value = String(params[paramName]);
							// Check regex pattern if available
							if (query.regex && !query.regex.test(value)) {
								continue;
							}

							// @ts-expect-error: fine
							validatedParams[paramName] = value;
						}
					}
				}
			}
		}

		// Also add arbitrary parameters that are explicitly allowed
		if (deepLink.arbitaryParameters) {
			for (const paramName in deepLink.arbitaryParameters) {
				const allowed = deepLink.arbitaryParameters[paramName];

				if (allowed && params[paramName] !== undefined) {
					validatedParams[paramName] = String(params[paramName]);
				}
			}
		}

		// Check if all required parameters are present
		for (const requiredParam of requiredParams) {
			if (validatedParams[requiredParam] === undefined) {
				return null; // Missing required parameter
			}
		}

		return new ParsedDeepLink<
			Extract<
				T,
				{
					name: U;
				}
			>
		>(
			{
				type,

				params: validatedParams,
				// biome-ignore lint/suspicious/noExplicitAny: Fine
			} as any,
			this as DeepLinkParser,
		);
	}

	public async parseAppsFlyerLink(
		url: string,
	): Promise<ParsedDeepLink<T> | null> {
		if (!url.startsWith(`https://${this._urls.appsFlyerBaseUrl}`)) {
			return null;
		}
		const urlObj = new URL(url);

		const deepLinkMobile = urlObj.searchParams.get("af_dp");
		const deepLinkWeb = urlObj.searchParams.get("af_web_dp");

		// prioritize mobile over web
		if (deepLinkMobile) {
			return this.parseProtocolLink(deepLinkMobile);
		}

		if (deepLinkWeb) {
			return this.parseWebsiteLink(deepLinkWeb);
		}

		return null;
	}

	public async parseWebsiteLink(
		url: string,
	): Promise<ParsedDeepLink<T> | null> {
		const urlObj = new URL(url);
		let pathName = urlObj.pathname
			.replace(/([^:]\/)\/+/g, "$1")
			.replace(/\/$/, "");

		try {
			const split = pathName.split("/");
			const localeMaybe = split[1];
			if (
				localeMaybe &&
				LOCALE_REGEX.test(localeMaybe) &&
				!["js", "my"].includes(localeMaybe)
			) {
				split.splice(1, 1);
			}

			pathName = split.join("/");
		} catch {
			/* catch error */
		}

		const searchParams = urlObj.searchParams;

		for (const deepLink of this._deepLinks) {
			if (!deepLink.websiteUrls) continue;

			for (const url of deepLink.websiteUrls) {
				const match = url.regex.exec(pathName);
				if (!match) continue;

				const requiredGroups: string[] = [];
				let passing = true;

				let params: Record<string, string> = {};
				if (url.path) {
					if (!match.groups) {
						continue;
					}

					for (const path of url.path) {
						// @ts-expect-error: A very strange typescript issue
						params[path.name] = match.groups?.[path.name];
					}
				}

				if (url.query) {
					for (const search of url.query) {
						// @ts-expect-error: A very strange typescript issue
						const value = searchParams.get(search.name);
						if (!value) {
							if (
								search.required === true ||
								(typeof search.required === "string" &&
									// @ts-expect-error: A very strange typescript issue
									!requiredGroups.includes(search.name))
							) {
								passing = false;
								break;
							}

							continue;
						}

						if (typeof search.required === "string") {
							requiredGroups.push(search.required);
						}

						// @ts-expect-error: A very strange typescript issue
						params["mappedName" in search ? search.mappedName : search.name] =
							value;
					}
				}

				if (!passing) continue;
				if (deepLink.transformWebsiteParams) {
					const transformedParams = await deepLink.transformWebsiteParams(
						params,
						urlObj,
					);
					if (!transformedParams) continue;

					params = transformedParams;
				}

				return new ParsedDeepLink<T>(
					{
						type: deepLink.name,
						params,
						// biome-ignore lint/suspicious/noExplicitAny: Fine
					} as any,
					this as DeepLinkParser,
				);
			}
		}

		return null;
	}

	public async parseProtocolLink(
		url: string,
	): Promise<ParsedDeepLink<T> | null> {
		const prepend = `${this._urls.robloxProtocol}://`;
		const urlObj = new URL(url.replace(prepend, `${prepend}/`));
		if (urlObj.protocol !== `${this._urls.robloxProtocol}:`) {
			return null;
		}
		let searchParams = urlObj.searchParams;

		const pathNameSplit = urlObj.pathname.split("/");
		pathNameSplit.shift();

		let pathName = pathNameSplit.join("/");
		if (pathName.includes("=") && !urlObj.href.includes("?")) {
			searchParams = new URLSearchParams(pathName);
			pathName = "";
		}

		for (const deepLink of this._deepLinks) {
			if (!deepLink.protocolUrls) continue;

			for (const url of deepLink.protocolUrls) {
				const match = url.regex.exec(pathName);
				if (!match) continue;

				const requiredGroups: string[] = [];
				let passing = true;

				let params: Record<string, string> = {};
				if (url.path) {
					if (!match.groups) {
						continue;
					}

					for (const path of url.path) {
						// @ts-expect-error: A very strange typescript issue
						params[path.name] = match.groups[path.name];
					}
				}

				if (url.query) {
					for (const search of url.query) {
						// @ts-expect-error: A very strange typescript issue
						const value = searchParams.get(search.name);
						if (!value) {
							if (
								search.required === true ||
								(typeof search.required === "string" &&
									// @ts-expect-error: A very strange typescript issue
									!requiredGroups.includes(search.name))
							) {
								passing = false;
								break;
							}

							continue;
						}

						if (typeof search.required === "string") {
							requiredGroups.push(search.required);
						}

						// @ts-expect-error: A very strange typescript issue
						params["mappedName" in search ? search.mappedName : search.name] =
							value;
					}
				}

				if (!passing) continue;
				if (deepLink.transformProtocolParams) {
					const transformedParams =
						await deepLink.transformProtocolParams(params);
					if (!transformedParams) continue;

					params = transformedParams;
				}

				return new ParsedDeepLink<T>(
					{
						type: deepLink.name,
						params,
						// biome-ignore lint/suspicious/noExplicitAny: Fine
					} as any,
					this as DeepLinkParser,
				);
			}
		}

		return null;
	}

	public parseLink(url: string): Promise<ParsedDeepLink<T> | null> {
		if (url.startsWith(`https://${this._urls.appsFlyerBaseUrl}`)) {
			return this.parseAppsFlyerLink(url);
		}

		if (url.startsWith(`${this._urls.robloxProtocol}://`)) {
			return this.parseProtocolLink(url);
		}

		return this.parseWebsiteLink(url);
	}
}
