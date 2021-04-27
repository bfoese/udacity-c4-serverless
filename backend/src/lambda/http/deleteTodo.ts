import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { deleteTodo } from '../../domain/todo';
import { getUserId } from '../utils';
const middy = require('middy');
const { cors } = require('middy/middlewares');

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);

  const deleted = await deleteTodo(todoId, userId);
  if (!deleted) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'Item does not belong to user'
      })
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify({
    })
  };
}).use(cors());
