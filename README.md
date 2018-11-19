# adobe-ims-servicetoken
Load into your node.js application to easily manage Adobe IMS service tokens.

### Configuration
#### url
IMS URL for retrieving an access token, default is `https://ims-na1.adobelogin.com/ims/token`

#### grant_type
Grant type, default is `authorization_code`

#### client_id
IMS Client ID

#### client_secret
IMS Client Secret

#### code
IMS Client Code

### Example
```javascript
const ims = require('adobe-ims-servicetoken');

async function token () {
  let result;
  
  try {
    result = await ims({client_id: '', client_secret: '', code: ''});
  } catch (e) {
    console.error(e.message);
  }

  return result;
}
```
