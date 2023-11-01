import FormData from "form-data";
import {createHash} from "node:crypto";
import {
	BASE64,
	CLIENT_ID,
	CLIENT_SECRET,
	CODE,
	DEFAULT_GRANT_TYPE,
	DEFAULT_URL,
	EMPTY,
	GRANT_TYPE,
	JWT_TOKEN,
	POST,
	SHA1,
	STRING
} from "./constants.js";

const tokens = new Map();

export async function token ({
	url = DEFAULT_URL,
	grant_type = DEFAULT_GRANT_TYPE,
	client_id = EMPTY,
	client_secret = EMPTY,
	code = EMPTY,
	jwt_token = EMPTY
} = {}) {
	const key = createHash(SHA1).update(`${url}|${client_id}|${grant_type}`).digest(BASE64);
	let result;

	if (tokens.has(key) === false) {
		const form = new FormData();
		let res;

		if (grant_type.length > 0) {
			form.append(GRANT_TYPE, grant_type);
		}

		form.append(CLIENT_ID, client_id);
		form.append(CLIENT_SECRET, client_secret);

		if (code.length > 0) {
			form.append(CODE, code);
		}

		if (jwt_token.length > 0) {
			form.append(JWT_TOKEN, jwt_token);
		}

		try {
			res = await fetch(url, {
				method: POST,
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
