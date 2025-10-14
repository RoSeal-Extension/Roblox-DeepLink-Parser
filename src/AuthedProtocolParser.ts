import {
	DEFAULT_PLACELAUNCHER_URL,
	DEFAULT_ROBLOX_PLAYER_AUTHED_PROTOCOL,
	DEFAULT_ROBLOX_STUDIO_AUTH_AUTHED_PROTOCOL,
	DEFAULT_ROBLOX_STUDIO_AUTHED_PROTOCOL,
} from "./utils/constants";

export type AuthedProtocolUrls<T> = {
	robloxPlayerProtocol: T;
	robloxStudioProtocol: T;
	robloxStudioAuthProtocol: T;
	placeLauncherUrl: string;
};

export type AuthedProtocolParserConstructorProps<T extends string> = {
	urls?: Partial<AuthedProtocolUrls<T>>;
};

export type AuthedLaunchMode =
	| "edit"
	| "plugin"
	| "play"
	| "build"
	| "app"
	| "asset";

export type AuthLaunchExp = "InApp" | "PreferInApp" | "InBrowser";

export type AuthedStudioTask =
	| "EditFile"
	| "EditPlace"
	| "EditPlaceRevision"
	| "StartClient"
	| "StartTeamTest"
	| "InstallPlugin"
	| "TryAsset"
	| "RemoteDebug"
	| "StartServer";

export type AuthedDistributorType = "Global" | "ChinaJoinVenture";

export type AuthedOtherParams = {
	browsertrackerid?: number;
	robloxLocale?: string;
	gameLocale?: string;
	channel?: string;
	LaunchExp?: AuthLaunchExp;
	avatar?: string;
	assetid?: number;
	pluginid?: number;
	placeid?: number;
	universeid?: number;
	script?: string;
	placelauncherurl?: string;
	task?: AuthedStudioTask;
	traceId?: string;
	userId?: number;
	browser?: string;
	distributorType?: AuthedDistributorType;
	[key: string]: string | number | undefined;
};

export type BuildAuthedProtocolUrlParameters<T extends string> = {
	type: T;
	launchMode?: AuthedLaunchMode;
	gameInfo?: string;
	launchTime?: string;
	baseUrl?: string;
	otherParams?: AuthedOtherParams;

	// auth params
	state?: string;
	code?: string;
};

export type BuildAuthedPlaceLauncherRequest =
	| "RequestGame"
	| "RequestCloudEdit"
	| "RequestGameJob"
	| "RequestFollowUser"
	| "RequestPrivateGame"
	| "RequestPlayTogetherGame"
	| "RequestGameApp"
	| "RequestInvalid"
	| "RequestPlayWithParty"
	| "CheckGameJobStatus"
	| "RequestReservedGame"
	| "RequestCrossExpVoice";

export type AuthedPrivateGameMode = "ReservedServer";

export type BuildAuthedPlaceLauncherURLParameters<T extends string> = {
	request: BuildAuthedPlaceLauncherRequest;
	placeId?: number;
	jobId?: string;
	gameId?: string;
	gender?: string;
	genderId?: number;
	accessCode?: string;
	linkCode?: string;
	launchData?: string;
	privateGameMode?: AuthedPrivateGameMode;
	teleportType?: string;
	reservedServerAccessCode?: string;
	referralPage?: string;
	referredByPlayerId?: number;
	conversationId?: number;
	isPartyLeader?: boolean;
	isTeleport?: boolean;
	partyGuid?: string;
	isPlayTogetherGame?: boolean;
	joinAttemptId?: string;
	joinAttemptOrigin?: T;
	callId?: string;
	browserTrackerId?: number;
	eventId?: string;
	isolationContext?: string;
	gameJoinContext?: string;
	userId?: number;
};

export default class AuthedProtocolParser<T extends string, U extends string> {
	public _urls: AuthedProtocolUrls<T> = {
		robloxPlayerProtocol: DEFAULT_ROBLOX_PLAYER_AUTHED_PROTOCOL as T,
		robloxStudioProtocol: DEFAULT_ROBLOX_STUDIO_AUTHED_PROTOCOL as T,
		robloxStudioAuthProtocol: DEFAULT_ROBLOX_STUDIO_AUTH_AUTHED_PROTOCOL as T,
		placeLauncherUrl: DEFAULT_PLACELAUNCHER_URL,
	};

	constructor(props?: AuthedProtocolParserConstructorProps<T>) {
		if (props?.urls) {
			if (props.urls.robloxPlayerProtocol) {
				this._urls.robloxPlayerProtocol = props.urls.robloxPlayerProtocol;
			}
			if (props.urls.robloxStudioProtocol) {
				this._urls.robloxStudioProtocol = props.urls.robloxStudioProtocol;
			}
			if (props.urls.robloxStudioAuthProtocol) {
				this._urls.robloxStudioAuthProtocol =
					props.urls.robloxStudioAuthProtocol;
			}

			if (props.urls.placeLauncherUrl) {
				this._urls.placeLauncherUrl = props.urls.placeLauncherUrl;
			}
		}
	}

	public buildAuthedProtocolUrl(
		request: BuildAuthedProtocolUrlParameters<T>,
	): string {
		if (
			request.type === this._urls.robloxStudioAuthProtocol &&
			request.state &&
			request.code
		) {
			return `${this._urls.robloxStudioAuthProtocol}://?state=${request.state}&code=${request.code}`;
		}

		const params: string[] = ["1"];

		if (request.launchMode) params.push(`launchmode:${request.launchMode}`);
		if (request.gameInfo) params.push(`gameinfo:${request.gameInfo}`);
		if (request.launchTime) params.push(`launchtime:${request.launchTime}`);
		if (request.baseUrl) params.push(`baseUrl:${request.baseUrl}`);

		if (request.otherParams) {
			for (const key in request.otherParams) {
				const value = request.otherParams[key];
				if (key === value) {
					params.push(key);
				} else if (value !== undefined && value !== null) {
					params.push(`${key}:${encodeURIComponent(value)}`);
				}
			}
		}

		return `${request.type}:${params.join("+")}`;
	}

	public buildAuthedPlaceLauncherUrl(
		request: BuildAuthedPlaceLauncherURLParameters<U>,
	): string {
		const url = new URL(this._urls.placeLauncherUrl);
		const stringifiedParameters: Record<string, string> = {};
		for (const key in request) {
			const value = request[key as keyof typeof request];

			if (value !== undefined && value !== null) {
				stringifiedParameters[key] = String(value);
			}
		}

		url.search = new URLSearchParams(stringifiedParameters).toString();
		return url.toString();
	}

	public parseAuthedProtocolUrl(
		url: string,
	): BuildAuthedProtocolUrlParameters<T> | null {
		if (url.startsWith(`${this._urls.robloxStudioAuthProtocol}:`)) {
			const urlObj = new URL(url);
			return {
				type: this._urls.robloxStudioAuthProtocol,
				state: urlObj.searchParams.get("state") ?? undefined,
				code: urlObj.searchParams.get("code") ?? undefined,
			};
		}

		const isPlayer = url.startsWith(`${this._urls.robloxPlayerProtocol}:1`);
		const isStudio = url.startsWith(`${this._urls.robloxStudioProtocol}:1`);
		if (!isPlayer && !isStudio) {
			return null;
		}

		const split = url.split("+");

		const type = isPlayer
			? this._urls.robloxPlayerProtocol
			: this._urls.robloxStudioProtocol;

		const params: BuildAuthedProtocolUrlParameters<T> = {
			type,
		};

		for (let i = 1; i < split.length; i++) {
			const item = split[i];
			const [key, value] = item.split(":");
			if (!value) continue;

			switch (key.toLowerCase()) {
				case "launchmode": {
					params.launchMode = value as AuthedLaunchMode;
					break;
				}
				case "gameinfo": {
					params.gameInfo = value;
					break;
				}
				case "launchtime": {
					params.launchTime = value;
					break;
				}
				default: {
					params.otherParams ??= {};
					params.otherParams[key] = decodeURIComponent(value);
				}
			}
		}

		return params;
	}

	public parseAuthedPlaceLauncherUrl(
		urlStr: string,
	): BuildAuthedPlaceLauncherURLParameters<U> | null {
		try {
			const url = new URL(urlStr);

			const request = url.searchParams.get("request");
			if (!request) return null;

			const obj: BuildAuthedPlaceLauncherURLParameters<U> = {
				request: request as BuildAuthedPlaceLauncherRequest,
			};

			for (const [key, value] of url.searchParams) {
				let valueToSet: number | boolean | string;
				if (value === "true") {
					valueToSet = true;
				} else if (value === "false") {
					valueToSet = false;
				} else {
					const parsedNumber = Number(value);

					if (!Number.isNaN(parsedNumber)) {
						valueToSet = parsedNumber;
					} else {
						valueToSet = value;
					}
				}

				// @ts-expect-error: Fine tbh
				obj[key] = valueToSet;
			}

			return obj;
		} catch {
			return null;
		}
	}
}
