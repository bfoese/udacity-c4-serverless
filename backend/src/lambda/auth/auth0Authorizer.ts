import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { decode, verify } from 'jsonwebtoken';
import fetch from 'node-fetch';
import 'source-map-support/register';
import { JwtPayload } from '../../auth/JwtPayload';
import { AppConfig } from '../../config/app.config';
import { createLogger } from '../../utils/logger';


const logger = createLogger('auth');

// Done: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = AppConfig.jsonWebKeySet;

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

async function obtainCertificate(kid: string): Promise<{ alg: string, cert: string } | undefined> {
  if (!kid) {
    return undefined;
  }
  const result = await fetch(jwksUrl);

  const json: Array<{}> = await result.json();
  const certs = json ? ((json.keys as any) as []) : [];

  const filtered = certs ? certs.filter(cert => (cert as any).kid === kid) : [];

  if (filtered && filtered.length > 0) {
    return { alg: filtered[0].alg, cert: `-----BEGIN CERTIFICATE-----\n${filtered[0].x5c}\n-----END CERTIFICATE-----` };
  }
  return undefined;
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);

  let jwtKid;
  try {
    const jwt = token ? decode(token, { complete: true }) : undefined;
    jwtKid = jwt ? (jwt as any).header.kid : undefined;
  } catch {
    throw new Error('Failed to parse jwt token');
  }
  const certData = await obtainCertificate(jwtKid);
  if (!certData) {
    throw new Error('No certificate to validate JWT available');
  }
  return verify(token, certData.cert, { algorithms: [certData.alg] }) as JwtPayload;
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
