const FormData = require('form-data'),
  fetch = require('node-fetch'),
  hash128 = require('murmurhash3js').x64.hash128,
  tokens = new Map();

function clone (arg) {
  return JSON.parse(JSON.stringify(arg));
}

async function token ({url = 'https://ims-na1.adobelogin.com/ims/token', grant_type = 'authorization_code', client_id = '', client_secret = '', code = ''} = {}) {
  const key = hash128(`${url}|${client_id}|${grant_type}`);

  if (tokens.has(key) === false) {
    const form = new FormData();
    let res;

    form.append('grant_type', grant_type);
    form.append('client_id', client_id);
    form.append('client_secret', client_secret);
    form.append('code', code);

    try {
      res = await fetch(url, {
        method: 'POST',
        headers: form.getHeaders(),
        body: form
      });
    } catch (err) {
      res = {
        ok: false,
        statusText: err.message || err
      };
    }

    if (res.ok) {
      const data = await res.json();

      tokens.set(key, data.access_token);

      if (data.expires_in !== void 0) {
        setTimeout(() => tokens.delete(key), data.expires_in); // 24hr validity at time of dev
      }
    } else {
      throw new Error(res.statusText);
    }
  }

  return clone(tokens.get(key));
}

module.exports = token;
