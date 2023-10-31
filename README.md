# adobe-ims-servicetoken
Load into your node.js application to easily manage Adobe IMS service tokens. Multiple clients and/or grant types are supported with 1.1.0!

### Configuration
#### url
IMS URL for retrieving an access token, default is `https://ims-na1.adobelogin.com/ims/token`

#### grant_type (optional)
Grant type, default is `authorization_code`; set to `''` if exchanging a `JWT`

#### client_id
IMS Client ID

#### client_secret
IMS Client Secret

#### code (required if `jwt_token` is not supplied)
IMS Client Code

#### jwt_token (required if `code` is not supplied)
JWT for Access Token exchange

### Example
```javascript
import {token as ims} from 'adobe-ims-servicetoken';

export async function token () {
  let result;
  
  try {
    result = await ims({client_id: '', client_secret: '', code: ''});
  } catch (e) {
    console.error(e.message);
  }

  return result;
}
```
