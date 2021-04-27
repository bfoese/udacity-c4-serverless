import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import { getAllTodoItems } from '../../domain/todo';
import { getUserId } from '../utils';
const middy = require('middy');
const { cors } = require('middy/middlewares');


export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);
  const todos = await getAllTodoItems(userId);
  return {
    statusCode: 201,
    body: JSON.stringify({
      items: todos
    })
  };
}).use(cors());
