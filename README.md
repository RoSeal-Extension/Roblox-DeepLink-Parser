# Roblox DeepLink Parser
Parse Roblox deeplinks (roblox://*), website links (www.roblox.com), and appsflyer links (ro.blox.com) to get params and get new appysflyer/deeplink/website URLs.

## Example
```ts
import DeepLinkParser from "@roseal/roblox-deeplink-parser";
const parser = new DeepLinkParser();

// same as parser.parseWebsiteLink
parser.parseLink("https://www.roblox.com/my/avatar").then((link) => {
	if (link) {
        // roblox://navigation/avatar
		console.log(link.toProtocolUrl());
        // https://www.roblox.com/my/avatar
		console.log(link.toWebsiteUrl());
        // https://ro.blox.com/Ebh5?af_dp=roblox%3A%2F%2Fnavigation%2Favatar&af_web_dp=https%3A%2F%2Fwww.roblox.com%2Fmy%2Favatar
		console.log(link.toAppsFlyerUrl());
	}
});

// ... and you can do these as well specifically:
parser.parseDeepLink("roblox://navigation/avatar")
parser.parseAppsFlyerLink("https://ro.blox.com/Ebh5?af_dp=roblox%3A%2F%2Fnavigation%2Favatar&af_web_dp=https%3A%2F%2Fwww.roblox.com%2Fmy%2Favatar");
parser.parseWebsiteLink("https://www.roblox.com/my/avatar");
```

## Reference
| Deeplink | Website Equivalent | Description |
| -------- | ------------------ | ----------- |
| `roblox://experiences/start` or `roblox://` <br />Search Parameters:<br />- placeId<br />- userId<br />- gameInstanceId<br /> - accessCode<br />- linkCode<br />- launchData<br /> - joinAttemptId<br />- joinAttemptOrigin<br />- reservedServerAccessCode<br />- callId<br />- browserTrackerId<br />- referralPage<br />- referredByPlayerId | `www.roblox.com/games/start` <br />Search Parameters:<br />- placeId<br /> - gameInstanceId<br /> - accessCode<br />- linkCode<br />- launchData<br /> - joinAttemptId<br />- joinAttemptOrigin<br />- reservedServerAccessCode<br />- callId<br />- browserTrackerId<br />- referralPage<br />- referredByPlayerId | Join a server or user, for more information please see [Bloxstrap wiki](https://github.com/bloxstraplabs/bloxstrap/wiki/A-deep-dive-on-how-the-Roblox-bootstrapper-works#starting-roblox)
| `roblox://navigation/profile` or `roblox://navigation/group` <br />Search Parameters:<br />- groupId<br />- userId<br />- id (navigation/group only) | `www.roblox.com/users/{userId}/profile` or `www.roblox.com/groups/{groupId}/name` | Open webview of a user or group on the website
| `roblox://navigation/profile_card` <br />Search Parameters:<br />- userId | `www.roblox.com/users/{userId}/profile` | Opens the native app view of a user profile
| `roblox://navigation/content_posts` <br />Search Parameters:<br />- userId<br />- postId | N/A | Show content posts "captures" from a user or a specific post
| `roblox://navigation/share_links` <br />Search Parameters:<br />- type<br />- code | `www.roblox.com/share-links` <br />Search Parameters:<br />- type<br />- code | Resolve a share link, which could be a friend invite, experience details link, experience invite, etc.
| `roblox://navigation/gift_cards` | `www.roblox.com/giftcards` | Open webview of the giftcards page
| `roblox://navigation/external_web_link` <br />Search Parameters:<br />- domain (zendesk)<br />- locale<br />- articleId | `en.help.roblox.com/hc/{locale}/articles/{articleId}` | Open webview of a zendesk article
| `roblox://navigation/chat` <br />Search Parameters:<br />- userId<br />- chatId | N/A | Open chat conversation with a user or another type of conversation (group)
| `roblox://navigation/appeals` <br />Search Parameters:<br />- vid | `www.roblox.com/report-appeals#/v/{vid}` | Open webview of appeals page or a certain appeal request
| `roblox://navigation/home` | `www.roblox.com/home` | Open home page
| `roblox://navigation/event_details` <br />Search Parameters:<br />- eventId | `www.roblox.com/events/{eventId}` | Open details of an experience event
| `roblox://navigation/crossdevice` <br />Search Parameters:<br />- code | `www.roblox.com/crossdevicelogin/confirmcode` | Open crossdevice login page, and automatically enter the code if there was one in the deeplink
| `roblox://navigation/contacts` <br />Search Parameters:<br />- contactId<br />- assetId<br />- avatarImageUrl | N/A | Open contacts page (or friend requests page)
| `roblox://navigation/avatar_clothing_sort` | N/A | Open avatar clothing sorting page
| `roblox://navigation/avatar_profile_picture_editor` | N/A | Open avatar profile picture editor page
| `roblox://navigation/catalog` | `www.roblox.com/catalog` | Open avatar marketplace page
| `roblox://navigation/catalog/equip` <br />Search Parameters: ? | N/A | Supposedly equip an avatar item
| `roblox://navigation/friends` | `www.roblox.com/users/friends` | View the currently authenticated user's friends
| `roblox://navigation/avatar` | `www.roblox.com/my/avatar` | Open the avatar editor page
| `roblox://navigation/more` | N/A | Open the More section of the app
| `roblox://navigation/games` | `www.roblox.com/charts` | Open the charts page
| `roblox://navigation/sort` <br />Search Parameters:<br />- sortName | `www.roblox.com/charts#/sortName/{sortId}` | Open the charts sort page
| `roblox://navigation/item_details` <br />Search Parameters:<br />- itemType<br />- itemId | `www.roblox.com/catalog/{itemId}/name`, `www.roblox.com/bundles/{itemId}/name`, or `www.roblox.com/looks/{itemId}/name` | Open the details page of an avatar asset, bundle, or look
| `roblox://navigation/account_info` | `www.roblox.com/my/account#!/info` | Open webview of the account settings info page
| `roblox://navigation/notification_settings` | `www.roblox.com/my/account#!/notifications` | Open webview of the account settings notifications page
| `roblox://navigation/privacy_settings` | `www.roblox.com/my/account#!/privacy` | Open webview of the account settings privacy page
| `roblox://navigation/parental_controls` | `www.roblox.com/my/account#!/parental-controls` | Open webview of the account settings parental controls page
| `roblox://navigation/spending_settings` | `www.roblox.com/my/account#!/payment-methods` | Open webview of the account settings payment methods page
| `roblox://navigation/qr_code_redemption` <br />Search Parameters:<br />- itemType<br />- itemId | N/A | Redeem an item which can be obtained by scanning a QR code
| `roblox://navigation/game_details` <br />Search Parameters:<br />- gameId<br />- privateServerLinkCode | `www.roblox.com/games/{placeId}/name` <br />Search Parameters:<br />- privateServerLinkCode | Opens the details page of an experience
| `roblox://navigation/experience_sort` <br />Search Parameters: ? | N/A | Supposedly opens an experience sort page
| `roblox://navigation/security_alert` <br />Search Parameters: ? | N/A | ?