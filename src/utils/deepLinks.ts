import { LOCALE_REGEX, UUID_REGEX } from "./constants";

export type DeepLinkUrlQueryParameter<T extends string> = {
	regex?: RegExp;
	required?: boolean | string;
} & (
	| {
			name: T;
	  }
	| {
			name: string;
			mappedName: T;
	  }
);

export type DeepLinkUrlPathParameter<T extends string> = {
	name: T;
};

export type DeepLinkUrl<T extends string> = {
	regex: RegExp;
	query?: DeepLinkUrlQueryParameter<T>[];
	path?: DeepLinkUrlPathParameter<T>[];
};

export type DeepLink<
	T extends string,
	U extends string = string,
	V extends string = U,
	W extends string = U | V,
> = {
	name: T;
	protocolUrls?: DeepLinkUrl<U>[];
	websiteUrls?: DeepLinkUrl<V>[];
	transformProtocolParams?: (
		params: Record<U, string>,
	) => Record<W, string> | Promise<Record<W, string> | undefined>;
	transformWebsiteParams?: (
		params: Record<V, string>,
		url: URL,
	) => Record<W, string> | Promise<Record<W, string> | undefined>;
	arbitaryParameters?: Record<
		string,
		boolean | "protocol" | "website" | undefined
	>;
	toProtocolUrl?: ((params: Record<W, string>) => string) | string;
	toWebsiteUrl?: ((params: Record<W, string>) => string) | string;
};

/*
missing:
roblox://navigation/catalog/equip
roblox://navigation/sort?sortName=Discover
... need to figure out how they work
*/

export function getDeepLinks(
	getUniverseRootPlaceId: (universeId: number) => Promise<number | null>,
	getPlaceUniverseId: (placeId: number) => Promise<number | null>,
	robloxUrl: string,
) {
	return [
		{
			name: "userContentPosts",
			protocolUrls: [
				{
					regex: /^navigation\/content_posts$/i,
					query: [
						{
							name: "userId",
							regex: /^\d+$/,
							required: true,
						},
						{
							name: "postId",
							regex: UUID_REGEX,
						},
					],
				},
			],
			toProtocolUrl: "navigation/content_posts",
		} as DeepLink<"userContentPosts", "userId" | "postId">,
		{
			name: "resolveShareLink",
			protocolUrls: [
				{
					regex: /^navigation\/share_links$/i,
					query: [
						{
							name: "type",
							required: true,
						},
						{
							name: "code",
							required: true,
						},
					],
				},
			],
			websiteUrls: [
				{
					regex: /^\/share(-links)?$/i,
					query: [
						{
							name: "code",
							required: true,
						},
						{
							name: "type",
							required: true,
						},
					],
				},
			],
			toProtocolUrl: "navigation/share_links",
			toWebsiteUrl: "/share-links",
		} as DeepLink<"resolveShareLink", "type" | "code">,
		{
			name: "giftCards",
			protocolUrls: [
				{
					regex: /^navigation\/gift_cards$/i,
				},
			],
			websiteUrls: [
				{
					regex: /^\/giftcards$/i,
				},
			],
			toProtocolUrl: "navigation/gift_cards",
			toWebsiteUrl: "/giftcards",
		} as DeepLink<"giftCards">,
		{
			name: "externalWebLink",
			protocolUrls: [
				{
					regex: /^navigation\/external_web_link$/i,
					query: [
						{
							name: "domain",
							regex: /^(zendesk)$/i,
							required: true,
						},
						{
							name: "locale",
							regex: LOCALE_REGEX,
						},
						{
							name: "articleId",
							regex: /^\d+$/,
						},
						{
							name: "type",
							regex:
								/^(policy_update|parental_controls_launch|spending_settings)$/,
						},
					],
				},
			],
			arbitaryParameters: {
				domain: "protocol",
				type: "protocol",
			},
			toProtocolUrl: "navigation/external_web_link",
			toWebsiteUrl: `https://en.help.${robloxUrl.replace("www", "en.help")}/hc/{locale}/articles/{articleId}`,
		} as DeepLink<"externalWebLink", "domain" | "locale" | "articleId">,
		{
			name: "chat",
			protocolUrls: [
				{
					regex: /^navigation\/chat$/i,
					query: [
						{
							name: "userId",
							regex: /^\d+$/,
						},
						{
							name: "chatId",
							regex: UUID_REGEX,
						},
					],
				},
			],
		} as DeepLink<"chat", "userId" | "chatId">,
		{
			name: "appeals",
			protocolUrls: [
				{
					regex: /^navigation\/appeals$/i,
					query: [
						{
							name: "vid",
							regex: /^\d+$/,
						},
					],
				},
			],
			websiteUrls: [
				{
					regex: /^\/report-appeals$/i,
				},
			],
			transformWebsiteParams: (_, url) => ({
				vid: url.hash.split("/")?.[2],
			}),
			toProtocolUrl: "navigation/appeals",
			toWebsiteUrl: "/report-appeals#/v/{vid}",
		} as DeepLink<"appeals", "vid">,
		{
			name: "home",
			protocolUrls: [
				{
					regex: /^navigation\/home$/i,
				},
			],
			websiteUrls: [
				{
					regex: /^\/home$/i,
				},
			],
			toProtocolUrl: "navigation/home",
			toWebsiteUrl: "/home",
		} as DeepLink<"home">,
		{
			name: "experienceEventDetails",
			protocolUrls: [
				{
					regex: /^navigation\/event_details$/i,
					query: [
						{
							name: "eventId",
							regex: /^\d+$/,
							required: true,
						},
					],
				},
			],
			websiteUrls: [
				{
					regex: /^\/events\/(?<eventId>\d+)$/i,
					path: [
						{
							name: "eventId",
						},
					],
				},
			],
			toProtocolUrl: "navigation/event_details",
			toWebsiteUrl: "/events/{eventId}",
		} as DeepLink<"experienceEventDetails", "eventId">,
		{
			name: "crossDeviceLogin",
			protocolUrls: [
				{
					regex: /^navigation\/crossdevice$/i,
				},
			],
			websiteUrls: [
				{
					regex: /^\/crossdevicelogin\/confirmcode$/i,
				},
			],
			arbitaryParameters: {
				code: "protocol",
			},
			toProtocolUrl: "navigation/crossdevice",
			toWebsiteUrl: "/crossdevicelogin/ConfirmCode",
		} as DeepLink<"crossDeviceLogin", "code">,
		{
			name: "contacts",
			protocolUrls: [
				{
					regex: /^navigation\/contacts$/i,
					query: [
						{
							name: "contactId",
							regex: UUID_REGEX,
						},
						{
							name: "assetId",
							regex: /^\d+$/,
						},
						{
							name: "avatarImageUrl",
						},
					],
				},
			],
			toProtocolUrl: "navigation/contacts",
		} as DeepLink<"contacts", "contactId" | "assetId" | "avatarImageUrl">,
		{
			name: "avatarClothingSort",
			protocolUrls: [
				{
					regex: /^navigation\/avatar_clothing_sort$/i,
				},
			],
			toProtocolUrl: "navigation/avatar_clothing_sort",
		} as DeepLink<"avatarClothingSort">,
		{
			name: "avatarProfilePictureEditor",
			protocolUrls: [
				{
					regex: /^navigation\/avatar_profile_picture_editor$/i,
				},
			],
			toProtocolUrl: "navigation/avatar_profile_picture_editor",
		} as DeepLink<"avatarProfilePictureEditor">,
		{
			name: "avatarMarketplace",
			protocolUrls: [
				{
					regex: /^navigation\/catalog$/i,
				},
			],
			websiteUrls: [
				{
					regex: /^\/catalog$/i,
				},
			],
			toWebsiteUrl: "/catalog",
			toProtocolUrl: "navigation/catalog",
		} as DeepLink<"avatarMarketplace">,
		{
			name: "userFriends",
			protocolUrls: [
				{
					regex: /^navigation\/friends$/i,
				},
			],
			toWebsiteUrl: "/users/friends",
			toProtocolUrl: "navigation/friends",
		} as DeepLink<"userFriends">,
		{
			name: "avatarCustomization",
			protocolUrls: [
				{
					regex: /^navigation\/avatar$/i,
				},
			],
			websiteUrls: [
				{
					regex: /^\/my\/avatar$/i,
				},
			],
			toWebsiteUrl: "/my/avatar",
			toProtocolUrl: "navigation/avatar",
		} as DeepLink<"avatarCustomization">,
		{
			name: "agentProfile",
			protocolUrls: [
				{
					regex: /^navigation\/profile(?<isProfileCard>_card)?$/i,
					query: [
						{
							name: "userId",
							regex: /^\d+$/,
							required: "primaryParameter",
						},
						{
							name: "groupId",
							regex: /^\d+$/,
							required: "primaryParameter",
						},
					],
					path: [
						{
							name: "isProfileCard",
						},
					],
				},
				{
					regex: /^navigation\/group$/i,
					query: [
						{
							name: "id",
							mappedName: "groupId",
							regex: /^\d+$/,
						},
					],
				},
			],
			websiteUrls: [
				{
					regex: /^\/users\/(?<userId>\d+)/i,
					path: [
						{
							name: "userId",
						},
					],
				},
				{
					regex: /^\/groups\/(?<groupId>\d+)/i,
					path: [
						{
							name: "groupId",
						},
					],
				},
			],
			arbitaryParameters: {
				isProfileCard: "website",
				userId: "protocol",
				groupId: "protocol",
				id: "protocol",
			},
			toWebsiteUrl: (params) =>
				params.userId
					? `/users/${params.userId}/profile`
					: `/groups/${params.groupId}/name`,
			toProtocolUrl: (params) =>
				`navigation/profile${params.isProfileCard && !params.groupId ? "_card" : ""}`,
		} as DeepLink<
			"agentProfile",
			"userId" | "isProfileCard" | "groupId",
			"userId" | "groupId"
		>,
		{
			name: "navigationMore",
			protocolUrls: [
				{
					regex: /^navigation\/more$/i,
				},
			],
			toProtocolUrl: "navigation/more",
		} as DeepLink<"navigationMore">,
		{
			name: "charts",
			protocolUrls: [
				{
					regex: /^navigation\/games$/i,
				},
			],
			toWebsiteUrl: "/charts",
			toProtocolUrl: "navigation/charts",
		} as DeepLink<"charts">,
		/*
		{
			name: "sortDetails",
			protocolUrls: [
				{
					regex: /^navigation\/sort$/i,
					query: [
						{
							name: "sortName",
							regex: /^.+$/i,
						},
					],
				},
			],
		} as DeepLink<"sortDetails">,*/
		{
			name: "itemDetails",
			protocolUrls: [
				{
					regex: /^navigation\/item_details$/i,
					query: [
						{
							name: "itemType",
							regex: /^(Asset|Look|Bundle)$/i,
							required: true,
						},
						{
							name: "itemId",
							regex: /^\d+$/,
							required: true,
						},
					],
				},
			],
			websiteUrls: [
				{
					regex: /^\/(?<pageType>catalog|bundles|looks)\/(?<itemId>\d+)/i,
					path: [
						{
							name: "pageType",
						},
						{
							name: "itemId",
						},
					],
				},
			],
			arbitaryParameters: {
				itemType: "protocol",
				itemId: "protocol",
			},
			transformWebsiteParams: (params) => ({
				itemType:
					params.pageType.toLowerCase() === "catalog"
						? "Asset"
						: params.pageType.toLowerCase() === "bundles"
							? "Bundle"
							: "Look",
				itemId: params.itemId,
			}),
			toWebsiteUrl: (params) =>
				`/${params.itemType.toLowerCase() === "asset" ? "catalog" : params.itemType.toLowerCase() === "look" ? "looks" : "bundles"}/${params.itemId}/name`,
			toProtocolUrl: "navigation/item_details",
		} as DeepLink<
			"itemDetails",
			"itemType" | "itemId",
			"pageType" | "itemId",
			"itemType" | "itemId"
		>,
		{
			name: "settings",
			protocolUrls: [
				{
					regex:
						/^navigation\/(?<tabId>notification_settings|account_info|privacy_settings|parental_controls|spending_settings)$/i,
					path: [
						{
							name: "tabId",
						},
					],
				},
			],
			websiteUrls: [
				{
					regex: /^\/my\/account$/i,
				},
			],
			transformWebsiteParams: (_, url) => {
				const hash = url.hash.split("#!/")?.[1];

				// spending controls not handled atm.
				let tabId = "account_info";
				if (hash === "privacy") {
					tabId = "privacy_settings";
				} else if (hash === "parental-controls") {
					tabId = "parental_controls";
				} else if (hash === "notifications") {
					tabId = "notification_settings";
				} else if (hash === "payment-methods") {
					tabId = "spending_settings";
				}

				return {
					tabId,
				};
			},
			arbitaryParameters: {
				tabId: "protocol",
			},
			toProtocolUrl: "navigation/{tabId}",
			toWebsiteUrl: (params) => {
				let url = "/my/account";
				if (params.tabId === "privacy_settings") {
					url += "#!/privacy";
				} else if (params.tabId === "parental_controls") {
					url += "#!/parental-controls";
				} else if (params.tabId === "notification_settings") {
					url += "#!/notifications";
				} else if (params.tabId === "spending_settings") {
					url += "#!/payment-methods";
				} else {
					url += "#!/info";
				}

				return url;
			},
		} as DeepLink<"settings", "tabId">,
		{
			name: "joinUser",
			protocolUrls: [
				{
					regex: /^(experiences\/start)?$/i,
					query: [
						{
							name: "userId",
							regex: /^\d+$/,
							required: true,
						},
						{
							name: "joinAttemptId",
							regex: UUID_REGEX,
						},
						{
							name: "joinAttemptOrigin",
						},
						{
							name: "browserTrackerId",
							regex: /^\d+$/,
						},
					],
				},
			],
			toProtocolUrl: "experiences/start",
		} as DeepLink<
			"joinUser",
			"userId" | "joinAttemptId" | "joinAttemptOrigin" | "browserTrackerId"
		>,
		{
			name: "itemQRCodeRedemption",
			protocolUrls: [
				{
					regex: /^navigation\/qr_code_redemption$/i,
					query: [
						{
							name: "itemType",
							regex: /^(Asset|Bundle)$/i,
							required: true,
						},
						{
							name: "itemId",
							regex: /^\d+$/,
							required: true,
						},
					],
				},
			],
			arbitaryParameters: {
				itemId: "protocol",
				itemType: "protocol",
			},
			toProtocolUrl: "navigation/qr_code_redemption",
			toWebsiteUrl: (params) =>
				`/${params.itemType.toLowerCase() === "asset" ? "catalog" : "bundles"}/${params.itemId}/name`,
		} as DeepLink<"itemQRCodeRedemption", "itemType" | "itemId">,
		{
			name: "joinPlace",
			protocolUrls: [
				{
					regex: /^(experiences\/start)?$/i,
					query: [
						{
							name: "placeId",
							regex: /^\d+$/,
							required: true,
						},
						{
							name: "gameInstanceId",
							regex: UUID_REGEX,
						},
						{
							name: "accessCode",
						},
						{
							name: "linkCode",
							regex: /^\d+$/,
						},
						{
							name: "launchData",
						},
						{
							name: "joinAttemptId",
							regex: UUID_REGEX,
						},
						{
							name: "joinAttemptOrigin",
						},
						{
							name: "reservedServerAccessCode",
						},
						{
							name: "callId",
							regex: UUID_REGEX,
						},
						{
							name: "browserTrackerId",
							regex: /^\d+$/,
						},
						{
							name: "referralPage",
						},
						{
							name: "referredByPlayerId",
							regex: /^\d+$/,
						},
					],
				},
			],
			toProtocolUrl: "experiences/start",
			toWebsiteUrl: "/games/start",
		} as DeepLink<
			"joinPlace",
			| "placeId"
			| "gameInstanceId"
			| "accessCode"
			| "linkCode"
			| "launchData"
			| "joinAttemptId"
			| "joinAttemptOrigin"
			| "reservedServerAccessCode"
			| "callId"
			| "browserTrackerId"
			| "referralPage"
			| "referredByPlayerId"
		>,
		{
			name: "experienceDetails",
			protocolUrls: [
				{
					regex: /^navigation\/game_details$/i,
					query: [
						{
							name: "gameId",
							regex: /^\d+$/,
							required: true,
						},
						{
							name: "privateServerLinkCode",
							regex: /^\d+$/i,
						},
					],
				},
			],
			websiteUrls: [
				{
					regex: /^\/games\/(?<placeId>\d+)/i,
					path: [
						{
							name: "placeId",
						},
					],
					query: [
						{
							name: "privateServerLinkCode",
							regex: /^\d+$/i,
						},
					],
				},
			],
			arbitaryParameters: {
				gameId: "protocol",
				placeId: "website",
			},
			transformProtocolParams: (params) =>
				getUniverseRootPlaceId(Number.parseInt(params.gameId, 10)).then(
					(rootPlaceId) =>
						rootPlaceId !== null
							? {
									...params,
									placeId: rootPlaceId.toString(),
								}
							: undefined,
				),
			transformWebsiteParams: (params) =>
				getPlaceUniverseId(Number.parseInt(params.placeId, 10)).then(
					(universeId) =>
						universeId !== null
							? {
									...params,
									gameId: universeId.toString(),
								}
							: undefined,
				),
			toProtocolUrl: "navigation/game_details",
			toWebsiteUrl: "/games/{placeId}/name",
		} as DeepLink<
			"experienceDetails",
			"gameId" | "privateServerLinkCode",
			"placeId" | "privateServerLinkCode"
		>,
	];
}
