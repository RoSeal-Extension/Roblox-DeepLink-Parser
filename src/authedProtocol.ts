export type LaunchMode = "edit" | "plugin" | "play" | "build" | "app" | "asset";

export type LaunchExp = "InApp" | "PreferInApp" | "InBrowser";

export type StudioTask =
	| "EditFile"
	| "EditPlace"
	| "EditPlaceRevision"
	| "StartClient"
	| "StartTeamTest"
	| "InstallPlugin"
	| "TryAsset"
	| "RemoteDebug"
	| "StartServer";

export type DistributorType = "Global" | "ChinaJoinVenture";

export type OtherParams = {
	browsertrackerid?: number;
	robloxLocale?: string;
	gameLocale?: string;
	channel?: string;
	LaunchExp?: LaunchExp;
	avatar?: string;
	assetid?: number;
	pluginid?: number;
	placeid?: number;
	universeid?: number;
	script?: string;
	placelauncherurl?: string;
	task?: StudioTask;
	traceId?: string;
	userId?: number;
	browser?: string;
	distributorType?: DistributorType;
	[key: string]: string | number | undefined;
};

export type BuildProtocolUrlV1Request = {
	type: string;
	launchMode?: LaunchMode;
	gameInfo?: string;
	launchTime?: string;
	baseUrl?: string;
	otherParams?: OtherParams;
};

export type PlaceLauncherRequest =
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

export type PrivateGameMode = "ReservedServer";

export type PlaceLauncherURLParameters = {
	request: PlaceLauncherRequest;
	placeId?: number;
	jobId?: string;
	gameId?: string;
	gender?: string;
	genderId?: number;
	accessCode?: string;
	linkCode?: string;
	launchData?: string;
	privateGameMode?: PrivateGameMode;
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
	joinAttemptOrigin?: string;
	callId?: string;
	browserTrackerId?: number;
	eventId?: string;
	isolationContext?: string;
	gameJoinContext?: string;
	userId?: number;
};

export function buildRobloxProtocolUrlV1(
	request: BuildProtocolUrlV1Request,
): string {
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

export function buildRobloxPlaceLauncherUrl(
	_url: string,
	parameters: PlaceLauncherURLParameters,
): string {
	const url = new URL(_url);
	const stringifiedParameters: Record<string, string> = {};
	for (const [key, value] of Object.entries(parameters)) {
		if (value !== undefined && value !== null) {
			stringifiedParameters[key] = String(value);
		}
	}
	url.search = new URLSearchParams(stringifiedParameters).toString();

	return url.toString();
}
