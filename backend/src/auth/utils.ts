import { decode } from 'jsonwebtoken';
import { JwtPayload } from './JwtPayload';

export type UpdateExpressionData = { updateExpr: string, attrValues: {}, attrNames: {} };

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt ? decodedJwt.sub : null;
}

/**
 * Generates a DynamoDb update expression from the given patchData object, i.e. `set #name=:name,#dueDate=:dueDate,#done=:done,#url=:url`
 */
export function createUpdateExpr(patchData: Object): UpdateExpressionData {

  let updateExpr = 'set ';
  const attrValues = {};
  const attrNames = {};

  for (const [key, value] of Object.entries(patchData)) {
    updateExpr = `${updateExpr}#${key}=:${key},`;
    attrValues[`:${key}`] = value;
    attrNames[`#${key}`] = key;
  }
  if (updateExpr.endsWith(',')) {
    updateExpr = updateExpr.substr(0, updateExpr.length - 1)
  }

  return { updateExpr, attrValues, attrNames };
}
