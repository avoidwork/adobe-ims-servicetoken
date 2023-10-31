/**
 * adobe-ims-servicetoken
 *
 * @copyright 2023 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 3.0.1
 */
'use strict';

var murmurHash3 = require('murmurhash3js');

const hash128 = murmurHash3.x64.hash128,
	tokens = new Map();

async function token ({
	url = "https://ims-na1.adobelogin.com/ims/token",
	grant_type = "authorization_code",
	client_id = "",
	client_secret = "",
	code = "",
	jwt_token = ""
} = {}) {
	const key = hash128(`${url}|${client_id}|${grant_type}`);
	let result;

	if (tokens.has(key) === false) {
		const form = new FormData();
		let res;

		if (grant_type.length > 0) {
			form.append("grant_type", grant_type);
		}

		form.append("client_id", client_id);
		form.append("client_secret", client_secret);

		if (code.length > 0) {
			form.append("code", code);
		}

		if (jwt_token.length > 0) {
			form.append("jwt_token", jwt_token);
		}

		try {
			res = await fetch(url, {
				method: "POST",
				headers: { "content-type": "multipart/form-data" },
				body: form
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

		const data = await res.json();

		if (res.ok) {
			tokens.set(key, data.access_token);
			result = structuredClone(data.access_token);

			if (data.expires_in !== void 0) {
				setTimeout(() => tokens.delete(key), data.expires_in); // 24hr validity at time of dev
			}
		} else {
			throw new Error(`[${res.status}] ${data.error}: ${data.error_description}`);
		}
	} else {
		result = structuredClone(tokens.get(key));
	}

	return result;
}

exports.token = token;
