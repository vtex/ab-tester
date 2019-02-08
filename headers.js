import * as cookies from 'cookie'

export function headerDefault() {
   return {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.vtex.ds.v10+json'
   }
}

// when finished, remove comment in `test-evaluation`

export function withAuthToken(currentHeaders, { vtex }, withRange, initial, final) {

   if (withRange) {
      currentHeaders['REST-Range'] = 'resources=' + initial + "-" + final
   }

   currentHeaders['VtexIdclientAutCookie'] = vtex.authToken;
   currentHeaders['Proxy-Authorization'] = vtex.authToken;

   return currentHeaders
}