/**
 * adobe-ims-servicetoken
 *
 * @copyright 2023 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 3.0.5
 */
'use strict';

var node_crypto = require('node:crypto');

const AMPERSAND = "&";
const BASE64 = "base64";
const CLIENT_ID = "client_id";
const CLIENT_SECRET = "client_secret";
const CODE = "code";
const CONTENT_TYPE = "content-type";
const DEFAULT_GRANT_TYPE = "authorization_code";
const DEFAULT_URL = "https://ims-na1.adobelogin.com/ims/token";
const EMPTY = "";
const FORM_URLENCODED = "application/x-www-form-urlencoded";
const GRANT_TYPE = "grant_type";
const JWT_TOKEN = "jwt_token";
const POST = "POST";
const SHA1 = "sha1";
const STRING = "string";

const tokens = new Map();

async function token ({
	url = DEFAULT_URL,
	grant_type = DEFAULT_GRANT_TYPE,
	client_id = EMPTY,
	client_secret = EMPTY,
	code = EMPTY,
	jwt_token = EMPTY
} = {}) {
	const key = node_crypto.createHash(SHA1).update(`${url}|${client_id}|${grant_type}`).digest(BASE64);
	let result;

	if (tokens.has(key) === false) {
		const body = [
			`${CLIENT_ID}=${client_id}`,
			`${CLIENT_SECRET}=${client_secret}`
		];
		let res;

		if (grant_type.length > 0) {
			body.push(`${GRANT_TYPE}=${grant_type}`);
		}

		if (code.length > 0) {
			body.push(`${CODE}=${code}`);
		}

		if (jwt_token.length > 0) {
			body.push(`${JWT_TOKEN}=${jwt_token}`);
		}

		try {
			res = await fetch(url, {
				method: POST,
				headers: {
					[CONTENT_TYPE]: FORM_URLENCODED
				},
				body: body.join(AMPERSAND)
			});
		} catch (err) {
			res = {
				ok: false,
				statusText: err.message || err,
				json: async () => {
					return {
						error: res.statusText,
						error_description: err.message
					};
				},
				text: async () => err.message || err
			};
		}

		if (res.ok) {
			const data = await res.clone().json();

			tokens.set(key, data.access_token);
			result = structuredClone(data.access_token);

			if (data.expires_in !== void 0) {
				setTimeout(() => tokens.delete(key), data.expires_in); // 24hr validity at time of dev
			}
		} else {
			let data;

			try {
				data = await res.clone().json();
			} catch (err) {
				data = await res.clone().text();
			}

			const errorMsg = typeof data === STRING ? res.statusText : `${data?.error}: ${data?.error_description}`;
			throw new Error(`[${res.status}] ${errorMsg}`);
		}
	} else {
		result = structuredClone(tokens.get(key));
	}

	return result;
}

exports.token = token;
