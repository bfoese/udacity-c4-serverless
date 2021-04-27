import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { generateAttachmentUploadUrl } from '../../domain/todo';
const middy = require('middy');
const { cors } = require('middy/middlewares');

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const url = await generateAttachmentUploadUrl(event);
  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: url
    })
  };
}).use(cors());
