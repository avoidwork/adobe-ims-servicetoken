/**
 * adobe-ims-servicetoken
 *
 * @copyright 2023 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 3.0.2
 */
import murmurHash3 from'murmurhash3js';import FormData from'form-data';const hash128 = murmurHash3.x64.hash128,
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
				headers: form.getHeaders(),
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

		const data = res.ok ? await res.clone().json() : await res.clone().text();

		if (res.ok) {
			tokens.set(key, data.access_token);
			result = structuredClone(data.access_token);

			if (data.expires_in !== void 0) {
				setTimeout(() => tokens.delete(key), data.expires_in); // 24hr validity at time of dev
			}
		} else {
			const errorMsg = typeof data === "string" ? res.statusText : `${data?.error}: ${data?.error_description}`;
			throw new Error(`[${res.status}] ${errorMsg}`);
		}
	} else {
		result = structuredClone(tokens.get(key));
	}

	return result;
}export{token};