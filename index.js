const FormData = require('form-data'),
  fetch = require('node-fetch');

let token;

function clone (arg) {
  return JSON.parse(JSON.stringify(arg));
}

async function sync ({url = 'https://ims-na1.adobelogin.com/ims/token', grant_type = 'authorization_code', client_id = '', client_secret = '', code = ''} = {}) {
  if (token === void 0) {
    const form = new FormData();

    form.append('grant_type', grant_type);
    form.append('client_id', client_id);
    form.append('client_secret', client_secret);
    form.append('code', code);

    const res = await fetch(url, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form
    });

    if (res.ok) {
      const data = await res.json();

      token = data.access_token;

      if (data.expires_in !== void 0) {
        setTimeout(() => {
          token = void 0;
        }, data.expires_in); // 24hr validity at time of dev
      }
    } else {
      throw new Error(res.statusText);
    }
  }

  return clone(token);
}

module.exports = sync;
