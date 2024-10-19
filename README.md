# Roblox DeepLink Parser
Parse Roblox deeplinks, website links, and appsflyer links to get params and get new appysflyer/deeplink/website URLs.

## Example
```ts
import DeepLinkParser from "@roseal/roblox-deeplink-parser";
const parser = new DeepLinkParser({});

// same as parser.parseWebsiteLink
parser.parseLink("https://www.roblox.com/my/avatar").then((link) => {
	if (link) {
        /*
        logs:
            roblox://navigation/avatar
            https://www.roblox.com/my/avatar
            https://ro.blox.com/Ebh5?af_dp=roblox%3A%2F%2Fnavigation%2Favatar&af_web_dp=https%3A%2F%2Fwww.roblox.com%2Fmy%2Favatar
        */

		console.log(link.toProtocolUrl());
		console.log(link.toWebsiteUrl());
		console.log(link.toAppsFlyerUrl());
	}
});

// ... and you can do these as well specifically:
parser.parseDeepLink("roblox://navigation/avatar")
parser.parseAppsFlyerLink("https://ro.blox.com/Ebh5?af_dp=roblox%3A%2F%2Fnavigation%2Favatar&af_web_dp=https%3A%2F%2Fwww.roblox.com%2Fmy%2Favatar");
parser.parseWebsiteLink("https://www.roblox.com/my/avatar");
```