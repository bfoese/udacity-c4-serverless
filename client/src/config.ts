const apiId = '2c8pmo6aq5';
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`;

export const authConfig = {
  // DONE: Create an Auth0 application and copy values from it into this map
  domain: 'ataraxia.eu.auth0.com',            // Auth0 domain
  clientId: 'aftPNVhy0Cr16K1NwgovXBavF9aSgRUQ',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
