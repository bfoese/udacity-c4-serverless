import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { verify } from 'jsonwebtoken';
import 'source-map-support/register';
import { JwtPayload } from '../../auth/JwtPayload';
import { createLogger } from '../../utils/logger';


const logger = createLogger('auth');

// Done: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://ataraxia.eu.auth0.com/.well-known/jwks.json';

const cert = `-----BEGIN CERTIFICATE-----
MIIDBTCCAe2gAwIBAgIJc/yZskRG1vjVMA0GCSqGSIb3DQEBCwUAMCAxHjAcBgNV
BAMTFWF0YXJheGlhLmV1LmF1dGgwLmNvbTAeFw0yMTAxMDcxMjEwMDdaFw0zNDA5
MTYxMjEwMDdaMCAxHjAcBgNVBAMTFWF0YXJheGlhLmV1LmF1dGgwLmNvbTCCASIw
DQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMDB9Ewi12SfGE3UAticu9QEOsor
w5BeaVLEVuwwt0ImiiisI7q7vsorhbApbkEJN91CtBbv4j/EQo4HSx8VGVPGvAU9
iEEMKaVoc56gXaowemv6duzGcz3MOWJRRUX7DRBQwLMXgJ043LRnGTf2RZ92A4Id
NoSKLNxf8n1rGpDpfCiw6de32aurvn/iGBv3Ue7WyRV5lo23GL0hjHZaUwJzyx77
lSv3e6xPJWWiJ3ObFP/tSJG90KpHdYQtBx9wRjDmIjFACM+L94haqZ7AObCvPmU4
BHYC+HfoWo1vo7AGI3PcDSDXL7Pyvj5kJ4LC9w2CyDv3bfBEkCcKQvL+3b8CAwEA
AaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUgnLxpXjoko6KINWyuMn4
ucV4mlkwDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQCMTnWp7Nps
/ud5Zg5CaJFmF2J1DlmoxTXN7YhOIsEF7moMeRVy4Ka+djbXmZwCaah0eTP3UnLH
ef+TqJPmq3THyqV9ic8meyPQZVIyqzIu27TYj8YwBYhvOonwulQSOGYKTsbxDZEB
MNAx2YpsgcVxgwXEajyrtQ9Jzw29lopX4GAspsCuvmLgwSr0R0T7GflXmclQxUOI
wuTZ30DNkLUfQRAWgUyQP59LTu2Dn48dBl8zjFin4yPovqR/6NNOrxAJGiyoLB3j
2V5w/VTTAzkPK7S/3/IcK9K6mhPS64xny8hgL5uSZVzgLRJQUgKViwu36rZiXOpK
QczGuGEfJZbH
-----END CERTIFICATE-----`;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info('User was authorized', jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    };
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) {
    throw new Error('No authentication header');
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header');
  }
  const split = authHeader.split(' ');
  const token = split && split.length > 0 ? split[1] : undefined;
  return token;
}
